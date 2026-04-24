import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BoardColumn from '../components/BoardColumn';
import { TaskModal } from '../components/TaskModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { ProjectModal } from '../components/ProjectModal';
import { SearchFilter } from '../components/SearchFilter';
import { ToastContainer } from '../components/Toast';
import useModal from '../hooks/useModal';
import useToast from '../hooks/useToast';

const columnLabels = [
  { key: 'todo', title: 'To Do' },
  { key: 'in-progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
];

function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const navigate = useNavigate();
  
  const taskModal = useModal();
  const taskDetailsModal = useModal();
  const projectModal = useModal();
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projectRes, taskRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/${projectId}`),
      ]);
      setProject(projectRes.data);
      setTasks(taskRes.data);
      
      if (projectRes.data.members?.length > 0) {
        setMembers(projectRes.data.members);
      }

      try {
        const inviteRes = await api.get(`/projects/${projectId}/invites`);
        setPendingInvites(inviteRes.data);
      } catch (inviteErr) {
        if (inviteErr.response?.status !== 403) {
          console.warn('Failed to load invites', inviteErr);
        }
        setPendingInvites([]);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const groupedTasks = useMemo(() => {
    return columnLabels.reduce((acc, column) => {
      acc[column.key] = filteredTasks.filter((task) => task.status === column.key);
      return acc;
    }, {});
  }, [filteredTasks]);

  const handleCreateTask = async () => {
    fetchProjectData();
    success('Task created successfully');
    taskModal.close();
  };

  const handleTaskUpdated = async () => {
    fetchProjectData();
    success('Task updated');
    taskDetailsModal.close();
  };

  const handleTaskDeleted = async () => {
    fetchProjectData();
    success('Task deleted');
    taskDetailsModal.close();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    taskDetailsModal.open();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task))
      );
      success('Task status updated');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleProjectUpdate = async () => {
    fetchProjectData();
    success('Project updated');
    projectModal.close();
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      error('Enter an email to invite');
      return;
    }

    setInviteLoading(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email: inviteEmail.trim() });
      success('Invitation sent');
      setInviteEmail('');
      fetchProjectData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><div className="loading-state">Loading project...</div></div>;
  }

  if (!project) {
    return (
      <div className="page">
        <div className="error-state">Project not found</div>
      </div>
    );
  }

  return (
    <div className="page project-page">
      <div className="app-header">
        <div>
          <h1>{project?.title}</h1>
          <p>{project?.description || 'Project board'}</p>
        </div>
        <div className="header-actions">
          <button className="button" onClick={projectModal.open}>
            Edit Project
          </button>
          <button className="button secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
      <section className="card">
        <div className="section-header">
          <h2>Project Members</h2>
        </div>
        {project.createdBy?._id === user?.id && (
          <div className="invite-row">
            <input
              type="email"
              placeholder="Invite team member by email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={inviteLoading}
            />
            <button className="button primary" onClick={handleInviteMember} disabled={inviteLoading}>
              {inviteLoading ? 'Sending...' : 'Invite'}
            </button>
          </div>
        )}
        <div className="member-list">
          {project.members?.length > 0 ? (
            project.members.map((member) => (
              <div key={member._id} className="member-item">
                <span>{member.name}</span>
                <small>{member.email}</small>
              </div>
            ))
          ) : (
            <p>No members yet. The project owner can invite teammates.</p>
          )}
        </div>
        {pendingInvites.length > 0 && (
          <div className="pending-invites">
            <h3>Pending Invites</h3>
            {pendingInvites.map((invite) => (
              <div key={invite._id} className="invite-item">
                <span>{invite.email}</span>
                <small>Invited on {new Date(invite.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="board-grid">
        {columnLabels.map((column) => (
          <BoardColumn
            key={column.key}
            title={column.title}
            tasks={groupedTasks[column.key] || []}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
          />
        ))}
      </section>

      <TaskModal
        isOpen={taskModal.isOpen}
        onClose={taskModal.close}
        task={null}
        projectId={projectId}
        onSave={handleCreateTask}
        members={members}
      />

      <TaskDetailsModal
        isOpen={taskDetailsModal.isOpen}
        onClose={taskDetailsModal.close}
        task={selectedTask}
        onUpdate={handleTaskUpdated}
        onDelete={handleTaskDeleted}
        members={members}
      />

      <ProjectModal
        isOpen={projectModal.isOpen}
        onClose={projectModal.close}
        project={project}
        onSave={handleProjectUpdate}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default ProjectPage;
