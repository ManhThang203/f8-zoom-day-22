const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Lấy ra các nút
const addBtn = $(".add-btn");
const addkModal = $("#addTaskModal");

const modalClose = $(".modal-close");
const btnCancle = $(".btn-cancle");

const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");
const todoList = $("#todo-list");

let editIndex = null;

// hàm sử lý đóng Modal
function clossModal(){
    addkModal.className = "modal-overlay";
    const formTitle = addkModal.querySelector(".modal-title");
    if(formTitle){
        //  thẻ có class modal-title thì thêm dasset là data-original và có nội dùng là tưng ướng của thẻ đó
        formTitle.textContent = formTitle.dataset.original ?? formTitle.textContent;
        delete formTitle.dataset.original;
    }

    const submitBtn = addkModal.querySelector(".submit-btn");
    if(submitBtn){
        //  thẻ có class modal-title thì thêm dasset là data-original và có nội dùng là tưng ướng của thẻ đó
        submitBtn.textContent = submitBtn.dataset.original ?? submitBtn.textContent;
        delete formTitle.dataset.original;
    }
    setTimeout(() => {
        addkModal.querySelector(".modal").scrollTop = 0;
    },0)
    // reset Form
    todoForm.reset();
    // xóa bỏ editindex (căn cứ để biết đã đóng form sửa)
    editIndex = null;
}

// hàm mở Modal
function openModal(){
    addkModal.className = "modal-overlay show";
    // hàm sử lý sau 0.1s thì sẽ forcus vào input
    setTimeout(() => titleInput.focus(),100);
}

// openModal(); // khi user truy cập vào thì sẽ hiện thị Modal luôn 
// thực hiện đóng Modal
modalClose.onclick = clossModal;
btnCancle.onclick = clossModal;

// thực hiện clic vào nút Add new Task hiện ra Modal
addBtn.onclick = openModal;

// todotask chứ các thực tính và value khi được chuyền vào
// Trường hợp khi người dùng mới vào page web thì dữ liệu trong localStorage là Null hoặc underfile thì là mảng []
const todoTask = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

//  thực hiện submit của form
todoForm.onsubmit = event => { 
    event.preventDefault();
    // new FormData(todoForm)  chyển sang entries 
    // Object.fromEntries sẽ chuyển entries sang kiểu Object 
    // lấy data logic của cả sửa và thêm 
    // lấy toàn bộ form data (dữ liệu từ index, textrate, ...) 
    const newData = (Object.fromEntries(new FormData(todoForm)));
    console.log(newData);
    // Nếu có editIndex tức đang mở modal sửa
    // thực hiện logic sửa 
    if(editIndex){
       todoTask[editIndex] = newData;
       console.log(todoTask[editIndex])
    }
    // không có editIndex, tức đang mở modal thêm mới 
    // thực hiện logic thêm mới 
    else{
        // logic thêm mới
        newData.isCompleted = false; // Mặc địng task chưa được hoàn thành
        // thêm phần tử vào đầu mảng todoTask
        // logic thêm mới 
        todoTask.unshift(newData);
    }
    // lưu toàn bộ dánh sách task vào localStorage
    saveTask();
    // hàm render
    // logic của cả sửa và thêm 
    renderTask();
    // đóng form
    // logic của cả sửa và thêm 
    clossModal();
}

function saveTask() {
    // lưu các task vào localStorage dưới dạng chuỗi
    // logic của cả sửa và thêm 
    localStorage.setItem("todoTasks",JSON.stringify(todoTask));
}
// hàm sử lý nổi bot khi kích vào phần tử
todoList.onclick = event => {
    const editModal = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");
    const completeBtn = event.target.closest(".complete-btn");
    // Edit
    if(editModal){
        const taskIndex = editModal.dataset.index;
        const task = todoTask[taskIndex];
        editIndex = taskIndex;
        for(const key in task){
           const value = task[key];
           // sủ dụng css selector [attribute$=value] để lấy ra các thẻ input có name tương ứng 
           const input = $(`[name="${key}"]`);
           // nếu các thẻ mà có name tương ứng
           if(input){
               // lấy input truy cập đến value và gắn value
               input.value = value;
           }
        }
        const formTitle = addkModal.querySelector(".modal-title");
        if(formTitle){
                //  thẻ có class modal-title thì thêm dasset là data-original và có nội dùng là tưng ướng của thẻ đó
                formTitle.dataset.original = formTitle.textContent;
                formTitle.textContent = "Edit Task";
        }
        const submitBtn = addkModal.querySelector(".submit-btn");
        if(submitBtn){
            //  thẻ có class modal-title thì thêm dasset là data-original và có nội dùng là tưng ướng của thẻ đó
            submitBtn.dataset.original = submitBtn.textContent;
            submitBtn.textContent = "Save Task";
        }
        openModal();
    }
    if(deleteBtn){
        const taskIndex = deleteBtn.dataset.index;
        const task = todoTask[taskIndex];
        console.log(task);
        if(confirm(`Bạn có chắc muốn xóa công việc ${task.title} ?`)){
            todoTask.splice(taskIndex,1);
            saveTask();
            renderTask();
        }
    }
    if(completeBtn){
        const taskIndex = completeBtn.dataset.index;
        const task = todoTask[taskIndex];
        task.isCompleted = !task.isCompleted;
        saveTask();
        renderTask();
    }
}
// hàm sử lý render 
function renderTask() {
    if(!todoTask.length){
        todoList.innerHTML = `<p>Chưa có công việc nào</p>`
        // kết thức điều kiện và không cho thực hiện đoạn code còn lại
        return;
    }
    const html = todoTask.map((task,index) => 
        `<div class="task-card ${escapeHTML(task.color)} ${task.isCompleted ? "completed" : ""}">
                 <div class="task-header">
                     <h3 class="task-title">${escapeHTML(task.title)}</h3>
                     <button class="task-menu">
                         <i class="fa-solid fa-ellipsis fa-icon"></i>
                         <div class="dropdown-menu">
                             <div class="dropdown-item edit-btn" data-index="${index}">
                                 <i class="fa-solid fa-pen-to-square fa-icon"></i>
                                 Edit
                             </div>
                             <div class="dropdown-item complete complete-btn" data-index="${index}">
                                 <i class="fa-solid fa-check fa-icon"></i>
                                 ${task.isCompleted ? "Mark as Active" : "Mark as Completed"} 
                             </div>
                             <div class="dropdown-item delete delete-btn" data-index="${index}">
                                  <i class="fa-solid fa-trash fa-icon"></i>
                                 Delete
                             </div>
                         </div>
                     </button>
                 </div>
                 <p class="task-description">${escapeHTML(task.description)}</p>
                 <div class="task-time">${escapeHTML(task.startTime)} - ${escapeHTML(task.endTime)}</div>
         </div>`
    ).join("")
    // dữ liệu sẽ được hiển thị trong thẻ div và in ra trình duyệt
    todoList.innerHTML = html;
}
// Render lần đầu và lấy dữ liệu từ Local storage
renderTask();

// tạo hàm escapeHTML
 function escapeHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    //div.innerHTML chuyển về dạng code escape 
    return div.innerHTML;
 }