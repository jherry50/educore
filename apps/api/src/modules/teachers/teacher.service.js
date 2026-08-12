import { Teacher } from "./teacher.model.js";
import { User } from "../users/user.model.js";
import { Role } from "../roles/role.model.js";

import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/index.js";

async function getTeacherRole() {
  const role = await Role.findOne({
    name: {
      $regex: /^teacher$/i,
    },
  });

  if (!role) {
    throw new NotFoundError(
      "Teacher role not found."
    );
  }

  return role;
}

export async function getTeachers({
  search = "",
  department,
  employmentStatus,
} = {}) {
  const filter = {};

  if (department) {
    filter.department = department;
  }

  if (employmentStatus) {
    filter.employmentStatus =
      employmentStatus;
  }

  const teachers =
    await Teacher.find(filter)
      .populate(
        "user",
        "firstName lastName email phone isActive"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  if (!search) {
    return teachers;
  }

  const searchTerm =
    search.toLowerCase();

  return teachers.filter((teacher) => {
    const user = teacher.user;

    return (
      teacher.staffId
        ?.toLowerCase()
        .includes(searchTerm) ||
      user?.firstName
        ?.toLowerCase()
        .includes(searchTerm) ||
      user?.lastName
        ?.toLowerCase()
        .includes(searchTerm) ||
      user?.email
        ?.toLowerCase()
        .includes(searchTerm)
    );
  });
}

export async function getTeacherById(id) {
  const teacher =
    await Teacher.findById(id).populate(
      "user",
      "firstName lastName email phone isActive role"
    );

  if (!teacher) {
    throw new NotFoundError(
      "Teacher not found."
    );
  }

  return teacher;
}

export async function createTeacher(data) {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    staffId,
    qualification,
    department,
    specialization,
    employmentDate,
    employmentStatus,
    address,
  } = data;

  const existingUser =
    await User.findOne({
      email,
    });

  if (existingUser) {
    throw new ConflictError(
      "A user with this email already exists."
    );
  }

  const existingTeacher =
    await Teacher.findOne({
      staffId,
    });

  if (existingTeacher) {
    throw new ConflictError(
      "A teacher with this staff ID already exists."
    );
  }

  const teacherRole =
    await getTeacherRole();

  const bcrypt =
    await import("bcrypt");

  const hashedPassword =
    await bcrypt.default.hash(
      password,
      12
    );

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role: teacherRole._id,
    isActive: true,
    isEmailVerified: false,
  });

  try {
    const teacher =
      await Teacher.create({
        user: user._id,
        staffId,
        qualification,
        department,
        specialization,
        employmentDate,
        employmentStatus,
        address,
        isActive: true,
      });

    await teacher.populate(
      "user",
      "firstName lastName email phone isActive"
    );

    return teacher;
  } catch (error) {
    // Roll back the User if Teacher creation fails.
    await user.deleteOne();

    throw error;
  }
}

export async function updateTeacher(
  id,
  data
) {
  const teacher =
    await Teacher.findById(id);

  if (!teacher) {
    throw new NotFoundError(
      "Teacher not found."
    );
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    staffId,
    qualification,
    department,
    specialization,
    employmentDate,
    employmentStatus,
    address,
    isActive,
  } = data;

  if (
    staffId &&
    staffId !== teacher.staffId
  ) {
    const existingTeacher =
      await Teacher.findOne({
        staffId,
        _id: {
          $ne: id,
        },
      });

    if (existingTeacher) {
      throw new ConflictError(
        "A teacher with this staff ID already exists."
      );
    }

    teacher.staffId = staffId;
  }

  const user =
    await User.findById(
      teacher.user
    );

  if (!user) {
    throw new NotFoundError(
      "Teacher user account not found."
    );
  }

  if (firstName !== undefined) {
    user.firstName = firstName;
  }

  if (lastName !== undefined) {
    user.lastName = lastName;
  }

  if (email !== undefined) {
    const existingUser =
      await User.findOne({
        email,
        _id: {
          $ne: user._id,
        },
      });

    if (existingUser) {
      throw new ConflictError(
        "A user with this email already exists."
      );
    }

    user.email = email;
  }

  if (phone !== undefined) {
    user.phone = phone;
  }

  if (qualification !== undefined) {
    teacher.qualification =
      qualification;
  }

  if (department !== undefined) {
    teacher.department =
      department;
  }

  if (specialization !== undefined) {
    teacher.specialization =
      specialization;
  }

  if (employmentDate !== undefined) {
    teacher.employmentDate =
      employmentDate;
  }

  if (employmentStatus !== undefined) {
    teacher.employmentStatus =
      employmentStatus;
  }

  if (address !== undefined) {
    teacher.address = address;
  }

  if (isActive !== undefined) {
    teacher.isActive = isActive;
    user.isActive = isActive;
  }

  await user.save();
  await teacher.save();

  await teacher.populate(
    "user",
    "firstName lastName email phone isActive"
  );

  return teacher;
}

export async function deleteTeacher(
  id
) {
  const teacher =
    await Teacher.findById(id);

  if (!teacher) {
    throw new NotFoundError(
      "Teacher not found."
    );
  }

  await User.findByIdAndDelete(
    teacher.user
  );

  await teacher.deleteOne();
}