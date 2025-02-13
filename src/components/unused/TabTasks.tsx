
const TabTask = ({ selectedTask, onSelectTask }) => {
    const tasks = [
        { id: 'ml-visualization', label: 'Machine Learning Visualization' },
        { id: 'presentation-script', label: 'Presentation Script Generation' },
    ];

    return (
        <div className="tab-task">
            {tasks.map((task) => (
                <button
                    key={task.id}
                    className={`tab-button ${selectedTask === task.id ? 'active' : ''}`}
                    onClick={() => onSelectTask(task.id)}
                >
                    {task.label}
                </button>
            ))}
        </div>
    );
};

export default TabTask;
