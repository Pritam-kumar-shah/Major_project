import Call from "../model/call.model.js";

// Save Call
export const saveCall = async (req, res) => {
  try {
    const { receiver, callType, status, startedAt, endedAt } = req.body;

    const call = await Call.create({
      caller: req.user._id,
      receiver,
      callType,
      status,
      startedAt,
      endedAt,
    });

    res.status(201).json({
      success: true,
      message: "Call saved successfully",
      call,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Call History
export const getCallHistory = async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [{ caller: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("caller", "name username email avatar")
      .populate("receiver", "name username email avatar");

    res.status(200).json({
      success: true,
      calls,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Single Call
export const getCallById = async (req, res) => {
  try {
    const call = await Call.findById(req.params.id)
      .populate("caller", "name username email avatar")
      .populate("receiver", "name username email avatar");

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.status(200).json({
      success: true,
      call,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
