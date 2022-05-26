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
                viewAllData('EMPLOYEE');
                break;
            case 'View all roles':
                viewAllData('ROLE');
                break;
            case 'View all departments':
                viewAllData('DEPARTMENT');
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
    });
};

const viewAllData = (table) => {
    let query;
    if (table === 'DEPARTMENT') {query = `SELECT * FROM DEPARTMENT`;}

    else if (table === 'ROLE') {query = `SELECT R.id AS id, title, salary, D.name AS department FROM ROLE AS R LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id;`;}

    else {query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name as last_name, R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
    FROM EMPLOYEE AS E LEFT JOIN AS R ON E.role_id = R.id LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id LEFT JOIN EMPLOYEE AS M ON E.manager_ID = M.id;`;}

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);

        startTracker();
    });
};

const addRole = () => {
    const department = [];
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
        if (err) throw err;
        res.forEach(depart => {
            let departObj = {
                name: depart.name,
                value: depart.id
            }
            department.push(departObj);
        });

        let question = [
            {
                type: 'input',
                name: 'title',
                message: 'Whats the title of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Whats the salary of the role?'
            },
            {
                type: 'list',
                name: 'department',
                choices: department,
                message: 'What department is this role apart of?'
            }
        ];

        inquirer.prompt(question)
        .then(response => {
            const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;

            connection.query(query, [[response.title, response.salary, response.department]], (err, res) => {
                if (err) throw err;

                startTracker();
            });
        })
        .catch(err => {
            console.error(err);
        });
    });
}

