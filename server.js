// Dependencies

const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection ({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'M3g@n0814',
    database: 'employee_DB',
});

function startTracker() {
    const startQuestions = [{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        loop: false,
        choices: ('View all employees', 'View all roles', 'View all departments', 'Add a role', 'Add an employee', 'Add a department', 'Remove employee', 'Remove role', 'Remove department','Exit')

    }]
    
    inquirer.prompt(startQuestions)
    .then(response => {
        switch (response.action) {
            case 'View all employees':
                viewAll('EMPLOYEE');
                break;
            case 'View all roles':
                viewAll('ROLE');
                break;
            case 'View all departments':
                viewAll('DEPARTMENT');
                break;
            case 'Add a Role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Remove employee':
                removeEmployee();
                break;
            case 'Remove role':
                removeRole();
                break;
            case 'Remove department':
                removeDepartment();
                break;
            case 'Exit':
                connection.end();
                break;                                                
        } 
    })
};
