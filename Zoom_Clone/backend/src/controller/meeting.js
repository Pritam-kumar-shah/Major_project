import Meeting from "../model/meeting.models.js";

// Create Meeting
export const createMeeting = async (req, res) => {
  try {
    const { title, meetingType } = req.body;

    const meetingId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const meeting = await Meeting.create({
      meetingId,
      title: title || "New Meeting",
      meetingType: meetingType || "video",
      host: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meeting,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Join Meeting
export const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.body;

    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (!meeting.isActive) {
      return res.status(400).json({
        success: false,
        message: "Meeting has ended",
      });
    }

    if (meeting.participants.length >= meeting.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Meeting is full",
      });
    }

    const alreadyJoined = meeting.participants.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (!alreadyJoined) {
      meeting.participants.push(req.user._id);
      await meeting.save();
    }

    res.status(200).json({
      success: true,
      message: "Joined meeting successfully",
      meeting,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Meeting Details
export const getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      meetingId: req.params.meetingId,
    })
      .populate("host", "name username email avatar")
      .populate("participants", "name username email avatar status");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// End Meeting
export const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only host can end the meeting",
      });
    }

    meeting.isActive = false;
    meeting.endedAt = new Date();

    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Meeting ended successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
