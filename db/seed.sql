USE employee_DB;

INSERT INTO department (name)
VALUES
('Sales'),
('IT'),
('Fiance'),
('Marketing'),
('Design');

SELECT * FROM DEPARTMENT;

INSERT INTO role (title, salary, department_id)
VALUES
('Sales Represenative', 70000, 1),
('IT Specialist', 100000, 2),
('Accountant Manager', 95000, 3),
('Accountant', 80000, 3),
('Product Manager', 95000, 4),
('Marketing Lead', 85000, 4),
('Web Design Manager', 120000, 5),
('Web Developer', 80000, 5);

SELECT * FROM ROLE;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Roronoa', 'Zoro', 3, 1),
('Monkey D.', 'Luffy', 5, 2),
('Nami', 'Bellmere', 4, 3),
('Nico', 'Robin', 2, NULL),
('Cutty', 'Flam', 1, NULL);

SELECT * FROM employee;