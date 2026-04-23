import { useState } from 'react';

export function SearchFilter({ onFilter, tasks = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, filterStatus, filterPriority, filterAssignee);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    applyFilters(searchTerm, value, filterPriority, filterAssignee);
  };

  const handlePriorityChange = (e) => {
    const value = e.target.value;
    setFilterPriority(value);
    applyFilters(searchTerm, filterStatus, value, filterAssignee);
  };

  const handleAssigneeChange = (e) => {
    const value = e.target.value;
    setFilterAssignee(value);
    applyFilters(searchTerm, filterStatus, filterPriority, value);
  };

  const applyFilters = (search, status, priority, assignee) => {
    let filtered = tasks;

    if (search) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((task) => task.status === status);
    }

    if (priority !== 'all') {
      filtered = filtered.filter((task) => task.priority === priority);
    }

    if (assignee !== 'all') {
      filtered = filtered.filter((task) => task.assignedTo?._id === assignee);
    }

    onFilter(filtered);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterAssignee('all');
    onFilter(tasks);
  };

  const hasActiveFilters =
    searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all';

  const assignees = [...new Map(tasks.map((t) => [t.assignedTo?._id, t.assignedTo])).values()].filter(Boolean);

  return (
    <div className="search-filter">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>}
      </div>

      <div className="filter-group">
        <select value={filterStatus} onChange={handleStatusChange} className="filter-select">
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select value={filterPriority} onChange={handlePriorityChange} className="filter-select">
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select value={filterAssignee} onChange={handleAssigneeChange} className="filter-select">
          <option value="all">All Assignees</option>
          {assignees.map((assignee) => (
            <option key={assignee._id} value={assignee._id}>
              {assignee.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="button small" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
