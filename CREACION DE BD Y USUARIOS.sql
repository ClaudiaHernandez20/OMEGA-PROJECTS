-- CREAMOS LA BASE DE DATOS DEL SISTEMA OMEGA PROJECTS 
CREATE DATABASE IF NOT EXISTS db_omega_projects;

-- UTILIZAMOS LA BASE DEL SISTEMA OMEGA PROJECTS 
USE db_omega_projects;

-- CREAMOS LA TABLA DE USUARIO CON LOS CAMPOS QUE IDENTIFICAN A CADA USUARIO 
DROP TABLE IF EXISTS usuarios_login;
CREATE TABLE usuarios_login(
nom_usuario varchar(30) PRIMARY KEY,
correo varchar (60),
contrasena varchar (10),
tipo_usuario varchar (30),
area_pertenencia varchar (20)
);

-- INSERTAMOS LOS USUARIOS QUE TENDRAN ACCESO AL SISTEMA 
INSERT INTO usuarios_login (nom_usuario, correo, contrasena, tipo_usuario, area_pertenencia) 
  VALUES ('Diana Solano','solanodiana0514@gmail.com', SHA1('contraDiana'), 'ABD','Base de Datos');
  
INSERT INTO usuarios_login (nom_usuario, correo, contrasena, tipo_usuario, area_pertenencia) 
  VALUES ('Ixchel Valadez','dashix_2010@hotmail.com', SHA1('contraIxchel'), 'ABD','Líder de Proyecto');  

INSERT INTO usuarios_login (nom_usuario, correo, contrasena, tipo_usuario, area_pertenencia) 
  VALUES ('Roberto Vargas','robertsolarc12@gmail.com', SHA1('contraRoberto'), 'Sofisticado','Arquitectura');
  
INSERT INTO usuarios_login (nom_usuario, correo, contrasena, tipo_usuario, area_pertenencia) 
  VALUES ('Adrian Morales','amoralesaldaco@gmail.com', SHA1('contraAdrian'), 'Sofisticado','Análisis');
  
INSERT INTO usuarios_login (nom_usuario, correo, contrasena, tipo_usuario, area_pertenencia) 
  VALUES ('Ha Hoang Quoc','hahoangquoc@gmail.com', SHA1('contraHaHoang'), 'Programador de App','Desarrollo');  
  
INSERT INTO usuarios_login (nom_usuario, correo, contrasena, tipo_usuario, area_pertenencia) 
  VALUES ('Dario Torres','dario.brons@gmail.com', SHA1('contraDario'), 'Sofisticado','Pruebas');  

INSERT INTO usuarios_login (nom_usuario, correo, contrasena, tipo_usuario, area_pertenencia) 
  VALUES ('Estefania Arreola','phanie2098@gmail.com', SHA1('contraEstefani'), 'Sofisticado','Diseño');  
  
SELECT * FROM usuarios_login;