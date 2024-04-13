let todoItemsContainer = document.getElementById("todoItemsContainer");
let addTodoButton = document.getElementById("addTodoButton");
let saveTodoButton = document.getElementById("saveTodoButton");

function getTodoListFromLocalStorage() {
    let stringifiedTodoList = localStorage.getItem("todoList");
    let parsedTodoList = JSON.parse(stringifiedTodoList);
    if (parsedTodoList === null) {
        return [];
    } else {
        return parsedTodoList;
    }
}

let todoList = getTodoListFromLocalStorage();
let todosCount = todoList.length;

saveTodoButton.onclick = function() {
    localStorage.setItem("todoList", JSON.stringify(todoList));
};

async function fetchTodosFromBackend() {
    try {
        const response = await fetch('https://bosonq-assignment-1.onrender.com/todos');
        if (!response.ok) {
            throw new Error('Failed to fetch todos');
        }
        const todos = await response.json();
        return todos;
    } catch (error) {
        console.error('Error fetching todos from backend:', error);
        return [];
    }
}

async function loadTodosFromBackend() {
    try {
        const todos = await fetchTodosFromBackend();
        todoList = todos.map(todo => ({
            id: todo.id,
            title: todo.title,
            completed: todo.completed,
        }));
        displayTodos(todoList);
    } catch (error) {
        console.error('Error loading todos from backend:', error);
    }
}

loadTodosFromBackend();

function onAddTodo() {
    let userInputElement = document.getElementById("todoUserInput");
    let userInputValue = userInputElement.value;

    if (userInputValue === "") {
        alert("Enter Valid Text");
        return;
    }

    todosCount = todosCount + 1;

    let newTodo = {
        id: todosCount,
        title: userInputValue,
        completed: false,
    };
    todoList.push(newTodo);
    createAndAppendTodo(newTodo);
    userInputElement.value = "";
    saveTodoButton.click(); // Save changes to localStorage
}

addTodoButton.onclick = function() {
    onAddTodo();
};

async function onTodoStatusChange(todoId) {
    let todo = todoList.find(todo => todo.id === todoId);
    if (todo) {
        try {
            // Update the todo status on the backend
            const response = await fetch(`https://bosonq-assignment-1.onrender.com/todos/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    completed: !todo.completed
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update todo status');
            }
            // Update the todo status locally
            todo.completed = !todo.completed;
            saveTodoButton.click(); // Save changes to localStorage

            // Toggle strike-through style
            let labelElement = document.getElementById("label" + todoId);
            if (labelElement) {
                labelElement.classList.toggle("checked", todo.completed);
            }
        } catch (error) {
            console.error('Error updating todo status:', error);
        }
    }
}

async function onDeleteTodo(todoId) {
    try {
        const response = await fetch(`https://bosonq-assignment-1.onrender.com/todos/${todoId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
        // Remove the todo from the local list
        let deleteIndex = todoList.findIndex(todo => todo.id === todoId);
        if (deleteIndex !== -1) {
            todoList.splice(deleteIndex, 1);
        }
        // Remove the todo element from the UI
        let todoElement = document.getElementById("todo" + todoId);
        if (todoElement) {
            todoItemsContainer.removeChild(todoElement);
        }
        saveTodoButton.click(); // Save changes to localStorage
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

function createAndAppendTodo(todo) {
    let todoId = todo.id;
    let checkboxId = "checkbox" + todo.id;
    let labelId = "label" + todo.id;

    let todoElement = document.createElement("li");
    todoElement.classList.add("todo-item-container", "d-flex", "flex-row");
    todoElement.id = "todo" + todoId;
    todoItemsContainer.appendChild(todoElement);

    let inputElement = document.createElement("input");
    inputElement.type = "checkbox";
    inputElement.id = checkboxId;
    inputElement.checked = todo.completed;

    inputElement.onclick = function() {
        onTodoStatusChange(todoId);
    };

    inputElement.classList.add("checkbox-input");
    todoElement.appendChild(inputElement);

    let labelContainer = document.createElement("div");
    labelContainer.classList.add("label-container", "d-flex", "flex-row");
    todoElement.appendChild(labelContainer);

    let labelElement = document.createElement("label");
    labelElement.setAttribute("for", checkboxId);
    labelElement.id = labelId;
    labelElement.classList.add("checkbox-label");
    labelElement.textContent = todo.title;
    if (todo.completed) {
        labelElement.classList.add("checked");
    }
    labelContainer.appendChild(labelElement);

    let deleteIconContainer = document.createElement("div");
    deleteIconContainer.classList.add("delete-icon-container");
    labelContainer.appendChild(deleteIconContainer);

    let deleteIcon = document.createElement("i");
    deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");

    deleteIcon.onclick = function() {
        onDeleteTodo(todoId);
    };

    deleteIconContainer.appendChild(deleteIcon);
}

async function displayTodos(todos) {
    todoItemsContainer.innerHTML = ''; // Clear existing todos
    todos.forEach(todo => {
        createAndAppendTodo(todo);
    });
}
