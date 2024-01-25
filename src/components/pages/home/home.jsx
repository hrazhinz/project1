import React, { useState, useEffect } from 'react';
import {
    Container,
    TextField,
    Button,
    List,
    ListItem,
    Checkbox,
    IconButton,
    Typography,
    Pagination,
    ListItemText, DialogActions, DialogContent, DialogTitle, Dialog, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function EditTaskModal({ isOpen, onClose, task, onSave, onChange }) {
    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Редактировать задачу</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Название задачи"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={task?.title}
                    onChange={(e) => onChange({...task, title: e.target.value})}
                />
                <TextField
                    margin="dense"
                    label="Описание задачи"
                    type="text"
                    fullWidth
                    multiline
                    maxRows={4}
                    variant="outlined"
                    value={task?.description}
                    onChange={(e) => onChange({...task, description: e.target.value})}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={onSave}>Сохранить</Button>
            </DialogActions>
        </Dialog>
    );
}


export function HomePage() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('tasks')) || []);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [hideCompleted, setHideCompleted] = useState(false);
    const [page, setPage] = useState(1);
    const tasksPerPage = 5;

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    const handleEditTaskClick = (task) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
    };

    const handleEditTaskSave = () => {
        setTasks(tasks.map(task => task.id === editingTask.id ? editingTask : task));
        setIsEditModalOpen(false);
    };

    const handleAddTask = () => {
        const newTask = {
            id: Date.now(),
            title: taskTitle,
            description: taskDescription,
            status: 'новая',
            creationDate: new Date().toISOString().split('T')[0],
        };
        setTasks([...tasks, newTask]);
        setTaskTitle('');
        setTaskDescription('');
    };

    const handleDeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleToggleTaskStatus = (id) => {
        setTasks(tasks.map(task => task.id === id ? {...task, status: task.status === 'в работе' ? 'завершена' : 'в работе'} : task));
    };

    const filteredTasks = tasks
        .filter(task => (task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase())))
        .filter(task => !filterDate || task.creationDate === filterDate)
        .filter(task => !hideCompleted || task.status !== 'завершена')
        .slice((page - 1) * tasksPerPage, page * tasksPerPage);

    return (
        <Container maxWidth="lg" className="mt-5 mb-5">
            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                task={editingTask}
                onSave={handleEditTaskSave}
                onChange={setEditingTask}
            />
            <Paper className="p-5 mb-5">
                <div className="mb-5 flex flex-col gap-5">
                    <h1 className="font-bold">Создать задачу</h1>
                    <TextField fullWidth label="Название задачи" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                    <TextField fullWidth label="Описание задачи" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
                </div>
                <Button variant="contained" onClick={handleAddTask}>Добавить задачу</Button>
            </Paper>
            <Paper className="p-5">
                <div className="mb-5 flex flex-col gap-5">
                    <h1 className="font-bold">Фильтры</h1>
                    <TextField fullWidth label="Поиск" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <TextField fullWidth  type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    <div>
                        <Checkbox checked={hideCompleted} onChange={(e) => setHideCompleted(e.target.checked)} /> Скрыть выполненные
                    </div>
                </div>
            </Paper>

            <List>
                {filteredTasks.map(task => (
                    <Paper className="mt-5 mb-5">
                        <ListItem
                            key={task.id}
                            secondaryAction={
                                <>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="edit" onClick={() => handleEditTaskClick(task)}>
                                        <EditIcon />
                                    </IconButton>
                                    <Checkbox
                                        edge="end"
                                        checked={task.status === 'завершена'}
                                        onChange={() => handleToggleTaskStatus(task.id)}
                                    />
                                </>
                            }
                        >
                            <ListItemText primary={task.title} secondary={task.description + ` [${task.status}]`} />
                        </ListItem>
                    </Paper>
                ))}
            </List>
            <Pagination
                count={Math.ceil(tasks.length / tasksPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
            />
        </Container>
    );
}
