import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  activateSession,
  completeSession,
  deleteSession,
} from "./academicSession.service.js";

export async function create(
  req,
  res,
  next
) {
  try {
    const session =
      await createSession(req.body);

    res.status(201).json({
      success: true,
      message:
        "Academic session created successfully.",
      data: session,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An academic session with this name already exists.",
      });
    }

    next(error);
  }
}

export async function list(
  req,
  res,
  next
) {
  try {
    const sessions =
      await getSessions(req.query);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOne(
  req,
  res,
  next
) {
  try {
    const session =
      await getSessionById(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "Academic session not found.",
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(
  req,
  res,
  next
) {
  try {
    const session =
      await updateSession(
        req.params.id,
        req.body
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "Academic session not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Academic session updated successfully.",
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function activate(
  req,
  res,
  next
) {
  try {
    const session =
      await activateSession(
        req.params.id
      );

    res.json({
      success: true,
      message:
        "Academic session activated successfully.",
      data: session,
    });
  } catch (error) {
    if (
      error.message ===
      "Academic session not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function complete(
  req,
  res,
  next
) {
  try {
    const session =
      await completeSession(
        req.params.id
      );

    res.json({
      success: true,
      message:
        "Academic session completed successfully.",
      data: session,
    });
  } catch (error) {
    if (
      error.message ===
      "Academic session not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function remove(
  req,
  res,
  next
) {
  try {
    const session =
      await deleteSession(
        req.params.id
      );

    if (!session) {
      return res.status(404).json({
        success: false,
        message:
          "Academic session not found.",
      });
    }

    res.json({
      success: true,
      message:
        "Academic session deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}