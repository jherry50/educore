import "dotenv/config";

import bcrypt from "bcrypt";

import { connectDatabase } from "../config/database.js";
import { Permission } from "../modules/permissions/permission.model.js";
import { Role } from "../modules/roles/role.model.js";
import { User } from "../modules/users/user.model.js";

const resources = {
  dashboard: ["view"],

  students: [
    "view",
    "create",
    "update",
    "delete",
    "export",
  ],

  teachers: [
    "view",
    "create",
    "update",
    "delete",
    "export",
  ],

  parents: [
    "view",
    "create",
    "update",
    "delete",
  ],

  classes: [
    "view",
    "create",
    "update",
    "delete",
  ],

  academicSessions: [
    "view",
    "create",
    "update",
    "delete",
  ],

  terms: [
    "view",
    "create",
    "update",
    "delete",
  ],

  subjects: [
    "view",
    "create",
    "update",
    "delete",
  ],

  attendance: [
    "view",
    "create",
    "update",
    "export",
  ],

  results: [
    "view",
    "create",
    "update",
    "delete",
    "publish",
    "export",
  ],

  finance: [
    "view",
    "create",
    "update",
    "delete",
    "approve",
    "export",
  ],

  reports: [
    "view",
    "export",
  ],

  users: [
    "view",
    "create",
    "update",
    "delete",
  ],

  roles: [
    "view",
    "create",
    "update",
    "delete",
  ],

  permissions: [
    "view",
  ],

  settings: [
    "view",
    "update",
  ],
};

async function seed() {
  try {
    await connectDatabase();

    console.log("🌱 Starting database seed...");
    console.log("Creating permissions...");

    const permissionDocuments = [];

    for (const [resource, actions] of Object.entries(
      resources
    )) {
      for (const action of actions) {
        permissionDocuments.push({
          resource,
          action,
          name: `${resource}.${action}`,
          description: `Can ${action} ${resource}`,
          isSystem: true,
        });
      }
    }

    /*
     * Create/update permissions
     */
    for (const permission of permissionDocuments) {
      await Permission.updateOne(
        {
          resource: permission.resource,
          action: permission.action,
        },
        {
          $set: permission,
        },
        {
          upsert: true,
        }
      );
    }

    /*
     * Fetch all permissions created by this seed
     */
    const permissions = await Permission.find({
      name: {
        $in: permissionDocuments.map(
          (permission) => permission.name
        ),
      },
    });

    console.log(
      `✅ Created/updated ${permissions.length} permissions.`
    );

    /*
     * Create/update Administrator role
     */
    let adminRole = await Role.findOne({
      name: "Administrator",
    });

    if (!adminRole) {
      adminRole = await Role.create({
        name: "Administrator",
        description:
          "Full administrative access to EduCore SMS.",
        permissions: permissions.map(
          (permission) => permission._id
        ),
        isSystem: true,
        isActive: true,
      });

      console.log(
        "✅ Administrator role created."
      );
    } else {
      adminRole.permissions =
        permissions.map(
          (permission) => permission._id
        );

      adminRole.isSystem = true;
      adminRole.isActive = true;

      await adminRole.save();

      console.log(
        "✅ Administrator role updated."
      );
    }

    console.log(
      `Administrator has ${permissions.length} permissions.`
    );

    /*
     * Admin credentials
     */
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      "admin@educore.local";

    const adminPassword =
      process.env.ADMIN_PASSWORD ||
      "Admin@12345";

    /*
     * Create admin user
     */
    const existingAdmin =
      await User.findOne({
        email: adminEmail,
      });

    if (!existingAdmin) {
      const passwordHash =
        await bcrypt.hash(
          adminPassword,
          12
        );

      await User.create({
        firstName: "System",
        lastName: "Administrator",
        email: adminEmail,
        password: passwordHash,
        role: adminRole._id,
        isActive: true,
        isEmailVerified: true,
      });

      console.log(
        `✅ Admin created: ${adminEmail}`
      );
    } else {
      /*
       * Make sure existing admin still
       * has the Administrator role.
       */
      existingAdmin.role =
        adminRole._id;

      existingAdmin.isActive = true;

      await existingAdmin.save();

      console.log(
        `✅ Admin already exists: ${adminEmail}`
      );
    }

    console.log(
      "🎉 Database seeding completed successfully."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Database seeding failed:",
      error
    );

    process.exit(1);
  }
}

seed();