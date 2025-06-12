const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const addkModal = $("#addTaskModal");

const modalClose = $(".modal-close");
const btnCancle = $(".btn-cancle");

const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");
// hàm sử lý đóng Modal
function clossModal(){
    addkModal.className = "modal-overlay";
}

function openModal(){
    addkModal.className = "modal-overlay show";
    // hàm sử lý sau 0.1s thì sẽ forcus vào input
    setTimeout(() => titleInput.focus(),100);
}

openModal(); // khi user truy cập vào thì sẽ hiện thị Modal luôn 
// thực hiện đóng Modal
modalClose.onclick = clossModal;
btnCancle.onclick = clossModal;
// thực hiện clic vào nút Add new Task hiện ra Modal
addBtn.onclick = openModal;
// todotask chứ các thực tính và value khi được chuyền vào
const todoTask = [];

//  thực hiện submit của form
todoForm.onsubmit = event => {
    event.preventDefault();
    // new FormData(todoForm)  chyển sang entries 
    // Object.fromEntries sẽ chuyển entries sang kiểu Object 
    const newTask = (Object.fromEntries(new FormData(todoForm)));
    newTask.isCompleted = false; // Mặc địng task chưa được hoàn thành
    // thêm phần tử vào đầu mảng todoTask
    todoTask.unshift(newTask);
    // hàm render
    renderTask(todoTask);
    // rest Form
    todoForm.reset();
    // đóng form
    clossModal();
}
// hàm sử lý render 
function renderTask(tasks) {
    const html = tasks.map((task) => 
       `<div class="task-card ${task.color} ${task.isCompleted ? "completed" : ""}">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <button class="task-menu">
                        <i class="fa-solid fa-ellipsis fa-icon"></i>
                        <div class="dropdown-menu">
                            <div class="dropdown-item">
                                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                                Edit
                            </div>
                            <div class="dropdown-item complete">
                                <i class="fa-solid fa-check fa-icon"></i>
                                ${task.isCompleted ? "Mark as Active" : "Mark as Completed"} 
                            </div>
                            <div class="dropdown-item delete">
                                <i class="fa-solid fa-trash fa-icon"></i>
                                Delete
                            </div>
                        </div>
                    </button>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-time">${task.startTime} - ${task.endTime}</div>
        </div>`
    ).join("")
    const todoList = $("#todo-list");
    todoList.innerHTML = html;
}
