'use strict';

class ViewTask {
    root = null;
    nameField = null;
    submitButton = null;
    
    taskList = null;
    
    constructor() {
        this.root = document.querySelector('#view-task');
        this.nameField = this.root.querySelector('#name');
        this.submitButton = this.root.querySelector('#submit');
        
        this.taskList = d3.select('#tasks');
    }
    
    get name() {
        return this.nameField.value;
    }
    
    
    // -----------------------------------------------------
    // Registeration of handlers from the controller

    registerSubmitHandler(handler) {
        this.submitButton.addEventListener('click', event => {
            // Prevent the default behaviour of submitting the form and the reloading of the webpage.
            event.preventDefault();
            
            // Validate the inputs.
            name = this.name;
            if (name == null || name == '') {
            	// Give error feedback to user.
            	// 'Task name cannot be blank'
                alert('Task name cannot be blank.');
                return;
            }
            
            // Package all the task paramters into an object.
            let taskParameters = {'name': this.name};
            
            // Call the handler.
            handler(taskParameters);
        });
    }
    
    
    // -----------------------------------------------------
    // Class methods

    updateTasks(tasks) {
        alert(`ViewTask.updateTasks(${JSON.stringify(tasks)})`);
        
        const tasksUpdate = this.taskList
          .selectAll('li')
          .data(tasks)
        
        const tasksEnter = tasksUpdate.enter().append('li');
        const tasksExit = tasksUpdate.exit().remove();
        tasksEnter.merge(tasksUpdate).text(task => this.formatTaskInfo(task));
    }
    
    formatTaskInfo(task) {
        return `${task.name}: initial offset, LET offset, period, LET duration`;
    }
    
    toString() {
        return "ViewTask";
    }
}
