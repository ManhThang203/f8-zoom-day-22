const $ = document.querySelector.bind(document); // Rút gọn cú pháp cho document.querySelector
const $$ = document.querySelectorAll.bind(document); // Rút gọn cú pháp cho document.querySelectorAll

// Lấy ra các nút và phần tử DOM cần thiết
const addBtn = $(".add-btn"); // Nút "Add New Task"
const formModal = $("#addTaskModal"); // Modal thêm/chỉnh sửa tác vụ
const modalClose = $(".modal-close"); // Nút đóng modal (icon 'x')
const btnCancle = $(".btn-cancle"); // Nút "Cancel" trong modal
const todoForm = $(".todo-app-form"); // Form thêm/chỉnh sửa tác vụ
const todoList = $("#todo-list"); // Container chứa danh sách các tác vụ
const taskTitle = $("#taskTitle"); // Trường nhập tiêu đề tác vụ
const editBtn = $(".edit-btn"); // (Không dùng trực tiếp ở đây, xử lý qua ủy quyền sự kiện)
const searchInput = $(".search-input"); // Trường nhập tìm kiếm
const tabButtons = $$(".tab-button"); // Các nút lọc tác vụ (All, Active, Completed)



let editIndex = null; // Biến lưu trữ chỉ số của tác vụ đang được chỉnh sửa. null nếu đang thêm mới.
let currentFilter = "all"; // Biến trạng thái để theo dõi bộ lọc hiện tại: "all", "active", hoặc "completed".

// Hàm xử lý đóng modal (form)
function closeForm(){
    formModal.className = "modal-overlay"; // Ẩn modal bằng cách thay đổi class
    todoForm.reset(); // Đặt lại tất cả các trường trong form về giá trị mặc định

    // Khôi phục tiêu đề của modal khi đóng form
    const titleFrom = formModal.querySelector(".modal-title");
    if(titleFrom){
        // Sử dụng giá trị gốc đã lưu trong dataset.origin, nếu có
        titleFrom.textContent = titleFrom.dataset.origin || titleFrom.textContent;
        delete titleFrom.dataset.origin; // Xóa thuộc tính dataset.origin
    }
    // Khôi phục văn bản của nút submit khi đóng form
    const titleSubmit = formModal.querySelector(".submit-btn");
    if(titleSubmit){
        // Sử dụng giá trị gốc đã lưu trong dataset.origin, nếu có
        titleSubmit.textContent = titleSubmit.dataset.origin || titleSubmit.textContent;
        delete titleSubmit.dataset.origin; // Xóa thuộc tính dataset.origin
    }

    editIndex = null; // Đặt lại editIndex về null khi đóng form
}

// Hàm xử lý mở modal (form)
function opneForm(){
    formModal.className = "modal-overlay show"; // Hiển thị modal bằng cách thêm class "show"
    setTimeout(() => taskTitle.focus(),100); // Đặt con trỏ vào trường tiêu đề tác vụ sau một chút
}

// Dữ liệu tác vụ được lấy từ LocalStorage, nếu không có thì là một mảng rỗng
const todoTask = JSON.parse(localStorage.getItem("todotask")) ?? [];


// Hàm xử lý sự kiện khi submit form (thêm hoặc chỉnh sửa tác vụ)
todoForm.onsubmit = (event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form (tải lại trang)

    // Lấy dữ liệu từ form dưới dạng một đối tượng
    // lấy ra dữ liệu từ input 
    const fromValue = Object.fromEntries(new FormData(todoForm));

    // Kiểm tra trùng lặp tiêu đề tác vụ
    const isDuplicate = todoTask.some((task, index) =>
        // So sánh tiêu đề (không phân biệt chữ hoa/thường)
    // và đảm bảo rằng khi chỉnh sửa, không tự so sánh với chính nó
    (task.title.toLowerCase() === fromValue.title.toLowerCase()) && (editIndex === null || index !== parseInt(editIndex))
    );

    if (isDuplicate) {
        alert("Nhiệm vụ đã tồn tại! Vui lòng nhập nhiệm vụ mới ?"); // Hiển thị cảnh báo nếu trùng lặp
        return; // Dừng hàm, không thêm/chỉnh sửa tác vụ
    }

    // Nếu đang ở chế độ chỉnh sửa (editIndex có giá trị)
    if(editIndex !== null){
        todoTask[editIndex] = fromValue; // Cập nhật tác vụ hiện có
    }
    // Nếu đang ở chế độ thêm mới
    else{
        fromValue.isCompleted = false; // Mặc định tác vụ chưa được hoàn thành
        todoTask.unshift(fromValue); // Thêm tác vụ mới vào đầu mảng
    }

    saveTask(); // Lưu dữ liệu tác vụ vào LocalStorage
    closeForm(); // Đóng modal
    renderTask(); // Hiển thị lại danh sách tác vụ
}

// Hàm xử lý lưu dữ liệu tác vụ vào LocalStorage
function saveTask(){
    localStorage.setItem("todotask",JSON.stringify(todoTask)); // Chuyển mảng thành chuỗi JSON và lưu
}

// Xử lý sự kiện nổi bọt (event bubbling) trên todoList để mở modal hoặc xóa/hoàn thành tác vụ
todoList.onclick = (event) => {
    // Tìm phần tử gần nhất khớp với selector (để xác định nút nào được nhấp)
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");
    const completedBtn = event.target.closest(".complete-btn");

    // Xử lý khi nhấp vào nút "Edit"
    if(editBtn){
        const taskIndex = editBtn.dataset.index; // Lấy chỉ số của tác vụ từ thuộc tính data-index
        const ediTask = todoTask[taskIndex]; // Lấy đối tượng tác vụ tương ứng
        editIndex = taskIndex; // Lưu chỉ số tác vụ đang chỉnh sửa

        // Đổ dữ liệu của tác vụ vào form để chỉnh sửa
        for(let key in ediTask){
            const value = ediTask[key];
            const inputName = $(`[name="${key}"]`); // Tìm input/select/textarea bằng thuộc tính 'name'
            if(inputName){
                inputName.value = value;
            }
        }
        
        // Cập nhật tiêu đề modal thành "Edit Task"
        const titleFrom = formModal.querySelector(".modal-title");
        if(titleFrom){
            titleFrom.dataset.origin = titleFrom.textContent; // Lưu tiêu đề gốc
            titleFrom.textContent = "Edit Task";
        }
        // Cập nhật văn bản nút submit thành "Save Task"
        const titleSubmit = formModal.querySelector(".submit-btn");
        if(titleSubmit){
            titleSubmit.dataset.origin = titleSubmit.textContent; // Lưu văn bản gốc
            titleSubmit.textContent = "Save Task";
        }
        opneForm(); // Mở modal
    }

    // Xử lý khi nhấp vào nút "Delete"
    if(deleteBtn){
        const taskIndex = deleteBtn.dataset.index; // Lấy chỉ số của tác vụ
        const deleteTask = todoTask[taskIndex]; // Lấy đối tượng tác vụ
        // Hỏi xác nhận trước khi xóa
        if(confirm(`Bạn có chắc muốn xóa công việc "${deleteTask.title}"?`)){
            todoTask.splice(taskIndex,1); // Xóa 1 phần tử tại chỉ số đó
            saveTask(); // Lưu lại vào LocalStorage
            renderTask() // Hiển thị lại danh sách
        }
    }

    // Xử lý khi nhấp vào nút "Complete" (hoàn thành/chưa hoàn thành)
    if(completedBtn){
        const taskIndex = completedBtn.dataset.index; // Lấy chỉ số của tác vụ
        const completeTask = todoTask[taskIndex]; // Lấy đối tượng tác vụ
        completeTask.isCompleted = !completeTask.isCompleted; // Đảo ngược trạng thái hoàn thành
        saveTask(); // Lưu lại vào LocalStorage
        renderTask(); // Hiển thị lại danh sách
    }
}

// Xử lý tìm kiếm trực tiếp khi người dùng nhập vào ô tìm kiếm
searchInput.oninput = (event) => {
    const searchTerm = event.target.value.toLowerCase(); // Lấy từ khóa tìm kiếm và chuyển thành chữ thường
    console.log(searchTerm)
    // Tự động chuyển về bộ lọc "All Tasks" khi bắt đầu tìm kiếm
    currentFilter = "all";
    updateActiveClassForTabs(); // Cập nhật trạng thái active của các tab lọc
    renderTask(searchTerm); // Hiển thị lại tác vụ với từ khóa tìm kiếm
}

// Hàm lọc tác vụ dựa trên từ khóa tìm kiếm và bộ lọc hiện tại
function filterTasks(searchTerm = "") {
    
    let filteredTasks = todoTask; // Mặc định là toàn bộ tác vụ
    // Lọc theo trạng thái hoàn thành
    if (currentFilter === "active") {
        filteredTasks = todoTask.filter(task => !task.isCompleted); // Lọc tác vụ chưa hoàn thành
    } else if (currentFilter === "completed") {
        filteredTasks = todoTask.filter(task => task.isCompleted); // Lọc tác vụ đã hoàn thành
    }

    // Lọc theo từ khóa tìm kiếm 
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            // Tìm kiếm trong tiêu đề hoặc mô tả (không phân biệt chữ hoa/thường)
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    return filteredTasks; // Trả về danh sách tác vụ đã lọc
}

// Hàm hiển thị (render) các tác vụ lên giao diện
function renderTask(searchTerm = "") {
    // Lấy danh sách tác vụ đã được lọc
    const tasksToRender = filterTasks(searchTerm); 

    // Nếu không có tác vụ nào để hiển thị
    if(!tasksToRender.length){
        todoList.innerHTML = `
            <p>${searchTerm ? "Không tìm thấy công việc nào phù hợp với tìm kiếm của bạn." : "Chưa có công việc nào."}</p>
        `; // Hiển thị thông báo tương ứng
        return;
    }

    // Tạo chuỗi HTML từ mảng tác vụ đã lọc
    const html = tasksToRender.map((task,index) => `
           <div class="task-card ${task.color} ${task.isCompleted ? "completed" : ""}">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <button class="task-menu">
                            <i class="fa-solid fa-ellipsis fa-icon"></i>
                            <div class="dropdown-menu">
                                <div class="dropdown-item edit-btn" data-index=${index}>
                                    <i class="fa-solid fa-pen-to-square fa-icon"></i>
                                    Chỉnh sửa
                                </div>
                                <div class="dropdown-item complete complete-btn" data-index=${index}>
                                    <i class="fa-solid fa-check fa-icon"></i>
                                    ${task.isCompleted ? "Mark as Active" : "Mark as Completed"}
                                </div>
                                <div class="dropdown-item delete delete-btn" data-index=${index}>
                                     <i class="fa-solid fa-trash fa-icon"></i>
                                    Xóa
                                </div>
                            </div>
                        </button>
                    </div>
                    <p class="task-description">${task.description}</p>
                    <div class="task-time">${task.startTime} - ${task.endTime}</div>
           </div>`).join(""); // Nối các phần tử HTML thành một chuỗi

    todoList.innerHTML = html; // Đổ chuỗi HTML vào container danh sách tác vụ
}

renderTask(); // Gọi hàm renderTask khi tải trang để hiển thị dữ liệu từ LocalStorage

addBtn.onclick = opneForm; // Gán hàm mở form cho nút "Add New Task"
modalClose.onclick = closeForm; // Gán hàm đóng form cho nút đóng modal
btnCancle.onclick = closeForm; // Gán hàm đóng form cho nút "Cancel"

// Xử lý lọc theo tab (All, Active, Completed)
tabButtons.forEach(button => {
    button.addEventListener("click", (event) => {
        // Xóa class "active" khỏi tất cả các nút tab
        tabButtons.forEach(btn => btn.classList.remove("active"));
        // Thêm class "active" vào nút tab được click
        event.target.classList.add("active");

        const buttonText = event.target.textContent.trim(); // Lấy nội dung văn bản của nút
        if (buttonText === "All Task") {
            currentFilter = "all"; // Đặt bộ lọc hiện tại là "all"
        } else if (buttonText === "Active Task") {
            currentFilter = "active"; // Đặt bộ lọc hiện tại là "active"
        } else if (buttonText.includes("Completed")) { // Kiểm tra nếu nút chứa từ "Completed"
            currentFilter = "completed"; // Đặt bộ lọc hiện tại là "completed"
        }
        searchInput.value = ""; // Xóa nội dung ô tìm kiếm khi chuyển bộ lọc
        renderTask(); // Hiển thị lại tác vụ với bộ lọc mới
    });
});

// Thiết lập class "active" cho tab ban đầu (khi tải trang hoặc sau khi tìm kiếm)
function updateActiveClassForTabs() {
    tabButtons.forEach(btn => {
        // btn.classList.remove("active"); // Xóa class "active" khỏi tất cả các nút
        const buttonText = btn.textContent.trim();
        if (currentFilter === "all" && buttonText === "All Task") {
            btn.classList.add("active");
        }
    });
}

updateActiveClassForTabs(); // Gọi hàm này khi tải trang để thiết lập tab active ban đầu