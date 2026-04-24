const crypto = require('crypto');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Invite = require('../models/Invite');
const { sendEmail } = require('../utils/mailer');

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { members: req.user.id },
      ],
    }).populate('createdBy', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.createdBy._id.equals(req.user.id) || project.members.some((member) => member._id.equals(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, members } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user.id,
      members: Array.isArray(members) ? [...new Set(members), req.user.id] : [req.user.id],
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can update this project' });
    }

    const { title, description } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;

    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can delete this project' });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getProjectInvites = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.createdBy.equals(req.user.id) || project.members.some((member) => member.equals(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const invites = await Invite.find({ project: project._id, status: 'pending' }).sort({ createdAt: -1 });
    res.json(invites);
  } catch (error) {
    next(error);
  }
};

exports.addProjectMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can add members' });
    }

    const userToAdd = await User.findOne({ email });
    const inviteBaseUrl = process.env.INVITE_BASE_URL || 'http://localhost:5173/register?inviteToken=';

    if (userToAdd) {
      const alreadyMember = project.members.some((member) => member.equals(userToAdd._id));
      if (alreadyMember) {
        return res.status(400).json({ message: 'User is already a project member' });
      }

      project.members.push(userToAdd._id);
      await project.save();

      await sendEmail({
        to: userToAdd.email,
        subject: `Added to project: ${project.title}`,
        text: `Hi ${userToAdd.name},\n\nYou have been added to the project "${project.title}". Log in to Taskflow Pro to view the project and collaborate with the team.\n\nThanks,\nTaskflow Pro`,
      });

      return res.json(project);
    }

    const existingInvite = await Invite.findOne({
      project: project._id,
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    const token = existingInvite ? existingInvite.token : crypto.randomBytes(32).toString('hex');
    const expiresAt = existingInvite ? existingInvite.expiresAt : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = existingInvite || await Invite.create({
      project: project._id,
      email,
      token,
      expiresAt,
    });

    const inviteUrl = `${inviteBaseUrl}${invite.token}`;
    await sendEmail({
      to: email,
      subject: `Invitation to join project: ${project.title}`,
      text: `Hello,\n\nYou have been invited to join the Taskflow Pro project "${project.title}". Click the link below to register and join the project:\n\n${inviteUrl}\n\nThis invite expires in 7 days.\n\nThanks,\nTaskflow Pro`,
    });

    res.json({ message: 'Invitation email sent', projectId: project._id });
  } catch (error) {
    next(error);
  }
};
