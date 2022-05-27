// Dependencies.
const mysql = require('mysql');
const inquier = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'M3g@n0814',
    database: 'employee_DB',
});

// Connection to the Database.
connection.connect((err) => {
    if (err) throw err;

    startTracker();
});
// Function to give options to user to input/view data.
function startTracker() {
    const userQuestions = [{
        type: "list",
        name: "action",
        message: "What do you want to do?",
        loop: false,
        choices: ["View all departments", "View all roles", "View all employees", "Add department", "Add role", "Add employee", "Update role for an employee", "Update employee's manager", "View employees by manager", "Delete department", "Delete role", "Delete employee", "View the total budget of a department", "Exit"]
    }];

    inquier.prompt(userQuestions)
        .then(response => {
            switch (response.action) {
                case "View all departments":
                    viewAllData("DEPARTMENT");
                    break;
                case "View all roles":
                    viewAllData("ROLE");
                    break;
                case "View all employees":
                    viewAllData("EMPLOYEE");
                    break;
                case "Add department":
                    addDepartment();
                    break;
                case "Add role":
                    addRole();
                    break;
                case "Add employee":
                    addEmployee();
                    break;
                case "Update role for an employee":
                    updateRole();
                    break;
                case "View employees by manager":
                    viewManager();
                    break;
                case "Update employee's manager":
                    updateManager();
                    break;
                case "Delete department":
                    deleteDepartment();
                    break;
                case "Delete role":
                    deleteRole();
                    break;
                case "Delete employee":
                    deleteEmployee();
                    break;
                case "View the total budget of a department":
                    departmentBudget();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        })
        .catch(err => {
            console.error(err);
        });
};
// GET all department/role/employee stored data.
const viewAllData = (table) => {
    let query;
    if (table === "DEPARTMENT") {
        query = `SELECT * FROM DEPARTMENT`;
    }
    else if (table === "ROLE") {
        query = `SELECT R.id AS id, title, salary, D.name AS department
        FROM ROLE AS R LEFT JOIN DEPARTMENT AS D
        ON R.department_id = D.id;`;
    }
    else {
        query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
        FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
        LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
        LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`;
    };
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);

        startTracker();
    });
};
// POST a new department to the table. 
const addDepartment = () => {
    let inputQuestions = [
        {
            type: "input",
            name: "name",
            message: "Whats the department name?"
        }
    ];

    inquier.prompt(inputQuestions)
        .then(response => {
            const query = `INSERT INTO department (name) VALUES (?)`;
            connection.query(query, [response.name], (err, res) => {
                if (err) throw err;

                startTracker();
            });
        })
        .catch(err => {
            console.error(err);
        });
};

// POST a new role to the table.
const addRole = () => {
    const departments = [];
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
        if (err) throw err;

        res.forEach(dep => {
            let questionObj = {
                name: department.name,
                value: department.id
            }
            departments.push(questionObj);
        });

        let inputQuestions = [
            {
                type: "input",
                name: "title",
                message: "Whats the title of this role?"
            },
            {
                type: "input",
                name: "salary",
                message: "Whats the salary of this role?"
            },
            {
                type: "list",
                name: "department",
                choices: departments,
                message: "What department is this role in?"
            }
        ];

        inquier.prompt(inputQuestions)
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
};
// POST new employee to the table.
const addEmployee = () => {
    connection.query("SELECT * FROM EMPLOYEE", (err, employeeRes) => {
        if (err) throw err;
        const employeeData = [
            {
                name: 'None',
                value: 0
            }
        ];
        employeeRes.forEach(({ first_name, last_name, id }) => {
            employeeData.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        connection.query("SELECT * FROM ROLE", (err, roleRes) => {
            if (err) throw err;
            const roleData = [];
            roleRes.forEach(({ title, id }) => {
                roleData.push({
                    name: title,
                    value: id
                });
            });

            let inputQuestions = [
                {
                    type: "input",
                    name: "first_name",
                    message: "Whats the employee's first name?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "Whats the employee's last name?"
                },
                {
                    type: "list",
                    name: "role_id",
                    choices: roleData,
                    message: "Whats the employee's role?"
                },
                {
                    type: "list",
                    name: "manager_id",
                    choices: employeeData,
                    message: "Whos the employee's manager?"
                }
            ]

            inquier.prompt(inputQuestions)
                .then(response => {
                    const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
                    let manager_id = response.manager_id !== 0 ? response.manager_id : null;
                    connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
                        if (err) throw err;

                        startTracker();
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        });
    });
};

//GET all the role employee's list
const updateRole = () => {
    connection.query("SELECT * FROM EMPLOYEE", (err, employeeRes) => {
        if (err) throw err;
        const employeeData = [];
        employeeRes.forEach(({ first_name, last_name, id }) => {
            employeeData.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        connection.query("SELECT * FROM ROLE", (err, roleRes) => {
            if (err) throw err;
            const roleData = [];
            roleRes.forEach(({ title, id }) => {
                roleData.push({
                    name: title,
                    value: id
                });
            });

            let inputQuestions = [
                {
                    type: "list",
                    name: "id",
                    choices: employeeData,
                    message: "Which role do you want to update?"
                },
                {
                    type: "list",
                    name: "role_id",
                    choices: roleData,
                    message: "Whats the employee's new role?"
                }
            ];

            inquier.prompt(inputQuestions)
                .then(response => {
                    const query = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
                    connection.query(query, [
                        { role_id: response.role_id },
                        "id",
                        response.id ], (err, res) => {
                        if (err) throw err;

                        console.log("Employee's role updated!");
                        startTracker();
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        });
    });
};

//GET all the employee's list.
const viewManager = () => {
    connection.query("SELECT * FROM EMPLOYEE", (err, employeeRes) => {
        if (err) throw err;
        const employeeData = [{
            name: 'None',
            value: 0
        }];
        employeeRes.forEach(({ first_name, last_name, id }) => {
            employeeData.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        let inputQuestions = [
            {
                type: "list",
                name: "manager_id",
                choices: employeeData,
                message: "Which role do you want to update?"
            },
        ];

        inquier.prompt(inputQuestions)
            .then(response => {
                let manager_id, query;
                if (response.manager_id) {
                    query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
          FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
          LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
          LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
          WHERE E.manager_id = ?;`;
                } 
                else {
                    manager_id = null;
                    query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
          FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
          LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
          LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
          WHERE E.manager_id is null;`;
                }
                connection.query(query, [response.manager_id], (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    startTracker();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
};

//GET all the employee's list and update the manager's role.
const updateManager = () => {
    connection.query("SELECT * FROM EMPLOYEE", (err, employeeRes) => {
        if (err) throw err;
        const employeeData = [];
        employeeRes.forEach(({ first_name, last_name, id }) => {
            employeeData.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        const managerData = [{
            name: 'None',
            value: 0
        }];
        employeeRes.forEach(({ first_name, last_name, id }) => {
            managerData.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        let inputQuestions = [
            {
                type: "list",
                name: "id",
                choices: employeeData,
                message: "Which employee do you want to update?"
            },
            {
                type: "list",
                name: "manager_id",
                choices: managerData,
                message: "Whos the employee's new manager?"
            }
        ]

        inquier.prompt(inputQuestions)
            .then(response => {
                const query = `UPDATE EMPLOYEE SET ? WHERE id = ?;`;
                let manager_id = response.manager_id !== 0 ? response.manager_id : null;
                connection.query(query, [
                    { manager_id: manager_id },
                    response.id
                ], (err, res) => {
                    if (err) throw err;

                    console.log("successfully updated employee's manager");
                    startTracker();
                });
            })
            .catch(err => {
                console.error(err);
            });
    })

};
//DELETE select department data.
const deleteDepartment = () => {
    const departments = [];
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
        if (err) throw err;

        res.forEach(dep => {
            let questionObj = {
                name: department.name,
                value: department.id
            }
            departments.push(questionObj);
        });

        let inputQuestions = [
            {
                type: "list",
                name: "id",
                choices: departments,
                message: "What department do you want to delete?"
            }
        ];

        inquier.prompt(inputQuestions)
            .then(response => {
                const query = `DELETE FROM DEPARTMENT WHERE id = ?`;
                connection.query(query, [response.id], (err, res) => {
                    if (err) throw err;

                    startTracker();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
};
// DELETE select role data.
const deleteRole = () => {
    connection.query("SELECT * FROM ROLE", (err, res) => {
        if (err) throw err;

        const roleData = [];
        res.forEach(({ title, id }) => {
            roleData.push({
                name: title,
                value: id
            });
        });

        let inputQuestions = [
            {
                type: "list",
                name: "id",
                choices: roleData,
                message: "What role do you want to delete?"
            }
        ];

        inquier.prompt(inputQuestions)
            .then(response => {
                const query = `DELETE FROM ROLE WHERE id = ?`;
                connection.query(query, [response.id], (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} row(s) successfully deleted!`);
                    startTracker();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
};
//DELETE select employee data.
const deleteEmployee = () => {
    connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
        if (err) throw err;

        const employeeData = [];
        res.forEach(({ first_name, last_name, id }) => {
            employeeData.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        let inputQuestions = [
            {
                type: "list",
                name: "id",
                choices: employeeData,
                message: "Which employee do you want to delete?"
            }
        ];

        inquier.prompt(inputQuestions)
            .then(response => {
                const query = `DELETE FROM EMPLOYEE WHERE id = ?`;
                connection.query(query, [response.id], (err, res) => {
                    if (err) throw err;

                    startTracker();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });
};

const departmentBudget = () => {
    connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
        if (err) throw err;

        const departmentData = [];
        res.forEach(({ name, id }) => {
            departmentData.push({
                name: name,
                value: id
            });
        });

        let inputQuestions = [
            {
                type: "list",
                name: "id",
                choices: departmentData,
                message: "What department's budget do you want to see?"
            }
        ];

        inquier.prompt(inputQuestions)
            .then(response => {
                const query = `SELECT D.name, SUM(salary) AS budget FROM
                EMPLOYEE AS E LEFT JOIN ROLE AS R
                ON E.role_id = R.id
                LEFT JOIN DEPARTMENT AS D
                ON R.department_id = D.id
                WHERE D.id = ?
                `;
                connection.query(query, [response.id], (err, res) => {
                    if (err) throw err;
                    console.table(res);

                    startTracker();
                });
            })
            .catch(err => {
                console.error(err);
            });
    });

};