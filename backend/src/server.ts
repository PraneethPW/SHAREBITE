import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z, ZodError } from "zod";

import { auth } from "./middleware/auth";
import { createAiPlan } from "./services/ai";
import { pool, query } from "./db/pool";

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "https://sharebite.vercel.app",
    credentials: true,
  })
);

app.use(express.json());

const sign = (user: any) =>
  jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
    },
    process.env.JWT_SECRET || "dev",
    {
      expiresIn: "7d",
    }
  );

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    name: "FoodShare API",
  });
});






/* =========================================================
   REGISTER
========================================================= */

app.post("/auth/register", async (req, res, next) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const body = z
      .object({
        name: z
          .string()
          .trim()
          .min(2, "Enter your full name."),

        email: z
          .string()
          .trim()
          .toLowerCase()
          .email("Enter a valid email address."),

        password: z
          .string()
          .min(6, "Password must be at least 6 characters."),

        role: z.enum(["donor", "receiver"]),

        location: z
          .string()
          .trim()
          .min(2, "Enter your location."),
      })
      .parse(req.body);

    const existing = await query(
      "SELECT id FROM users WHERE email=$1",
      [body.email]
    );

    if (existing.rowCount) {
      return res.status(409).json({
        message:
          "That email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(
      body.password,
      10
    );

    const result = await query(
      `
      INSERT INTO users
      (name, email, password_hash, role, location)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id, name, email, role, location
      `,
      [
        body.name,
        body.email,
        passwordHash,
        body.role,
        body.location,
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      user,
      token: sign(user),
    });
  } catch (error) {
    next(error);
  }
});






/* =========================================================
   LOGIN
========================================================= */

app.post("/auth/login", async (req, res, next) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const body = z
      .object({
        email: z
          .string()
          .trim()
          .toLowerCase()
          .email("Enter a valid email address."),

        password: z.string(),
      })
      .parse(req.body);

    const result = await query(
      "SELECT * FROM users WHERE email=$1",
      [body.email]
    );

    const user = result.rows[0];

    if (
      !user ||
      !(await bcrypt.compare(
        body.password,
        user.password_hash
      ))
    ) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
    };

    res.json({
      user: safeUser,
      token: sign(safeUser),
    });
  } catch (error) {
    next(error);
  }
});






/* =========================================================
   CURRENT USER
========================================================= */

app.get("/me", auth, (req, res) => {
  res.json({
    user: req.user,
  });
});






/* =========================================================
   DONATIONS
========================================================= */

app.get("/donations", auth, async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT d.*, u.name AS donor_name
      FROM donations d
      JOIN users u ON u.id=d.donor_id
      WHERE d.status='available'
         OR d.donor_id=$1
      ORDER BY d.created_at DESC
      `,
      [req.user!.id]
    );

    res.json({
      donations: result.rows,
    });
  } catch (error) {
    next(error);
  }
});






/* =========================================================
   CREATE DONATION
========================================================= */

app.post("/donations", auth, async (req, res, next) => {
  try {
    if (req.user!.role !== "donor") {
      return res.status(403).json({
        message: "Only donors can add food",
      });
    }

    const body = z
      .object({
        title: z.string().min(2),
        category: z.string().min(2),
        quantity: z.number().int().positive(),
        location: z.string().min(2),
        pickupWindow: z.string().min(2),
        expiresAt: z.string(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const result = await query(
      `
      INSERT INTO donations
      (
        donor_id,
        title,
        category,
        quantity,
        location,
        pickup_window,
        expires_at,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        req.user!.id,
        body.title,
        body.category,
        body.quantity,
        body.location,
        body.pickupWindow,
        body.expiresAt,
        body.notes,
      ]
    );

    res.status(201).json({
      donation: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});






/* =========================================================
   CLAIM DONATION
========================================================= */

app.post(
  "/donations/:id/claim",
  auth,
  async (req, res, next) => {
    const client = await pool.connect();

    try {
      if (req.user!.role !== "receiver") {
        return res.status(403).json({
          message:
            "Only receivers can claim food",
        });
      }

      const donationResult = await query(
        `
        SELECT d.*, u.location AS donor_base
        FROM donations d
        JOIN users u ON u.id=d.donor_id
        WHERE d.id=$1
        `,
        [req.params.id]
      );

      const donation =
        donationResult.rows[0];

      if (!donation) {
        return res.status(404).json({
          message: "Donation not found",
        });
      }

      if (donation.status !== "available") {
        return res.status(409).json({
          message:
            "This donation was already claimed.",
        });
      }

      const aiPlan = await createAiPlan({
        origin: donation.location,
        destination: req.user!.location,
        food: donation.title,
        quantity: donation.quantity,
        pickupWindow: donation.pickup_window,
      });

      await client.query("BEGIN");

      await client.query(
        `
        UPDATE donations
        SET status='claimed'
        WHERE id=$1
        `,
        [donation.id]
      );

      const claim = await client.query(
        `
        INSERT INTO claims
        (
          donation_id,
          receiver_id,
          status,
          ai_plan
        )
        VALUES ($1,$2,'approved',$3)
        RETURNING *
        `,
        [
          donation.id,
          req.user!.id,
          aiPlan,
        ]
      );

      await client.query("COMMIT");

      res.status(201).json({
        claim: claim.rows[0],
        aiPlan,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  }
);






/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("SERVER ERROR:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.flatten(),
      });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Server error";

    res.status(500).json({
      message,
    });
  }
);






/* =========================================================
   SERVER
========================================================= */

const port = Number(
  process.env.PORT || 5000
);

app.listen(port, () => {
  console.log(
    `FoodShare API running on port ${port}`
  );
});