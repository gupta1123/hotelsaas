import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
} from "@chakra-ui/react";

const TaskModal = ({ isOpen, onClose, task, onSave, authToken, bookings }) => {
    const [taskName, setTaskName] = useState("Cleaning");
    const [priority, setPriority] = useState("Low");
    const [roomNumber, setRoomNumber] = useState("");
    const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
    const [status, setStatus] = useState("Assigned");
    const toast = useToast();

    useEffect(() => {
        if (task) {
            setTaskName(task.taskName || "Cleaning");
            setPriority(task.priority || "Low");
            setRoomNumber(task.roomNumber || "");
            setDueDate(task.dueDate || new Date().toISOString().split("T")[0]);
            setStatus(task.status || "Assigned");
        }
    }, [task]);

    const handleSave = async () => {
        const taskData = {
            taskName,
            priority,
            roomNumber,
            dueDate,
            status,
        };

        try {
            const response = task && task.taskId
                ? await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/editTask?taskId=${task.taskId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`
                    },
                    body: JSON.stringify(taskData),
                })
                : await fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`
                    },
                    body: JSON.stringify(taskData),
                });

            if (response.ok) {
                onSave();
                toast({
                    title: "Task saved.",
                    description: `Task has been ${task && task.taskId ? "updated" : "created"} successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onClose();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error saving task");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{task && task.taskId ? "Edit Task" : "Create Task"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl mb={3}>
                        <FormLabel>Task Name</FormLabel>
                        <Select value={taskName} onChange={(e) => setTaskName(e.target.value)}>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Room Service">Room Service</option>
                        </Select>
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Priority</FormLabel>
                        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </Select>
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Room Number</FormLabel>
                        <Input value={roomNumber} readOnly />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Due Date</FormLabel>
                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </FormControl>
                    <FormControl mb={3}>
                        <FormLabel>Status</FormLabel>
                        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </Select>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSave}>Save</Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TaskModal;