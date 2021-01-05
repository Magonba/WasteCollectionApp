\c wastecollectiondata;
CREATE SCHEMA IF NOT EXISTS usersprojects;
CREATE TABLE IF NOT EXISTS usersprojects.users (
  email varchar(255) NOT NULL,
  PRIMARY KEY(email)
);
CREATE TABLE IF NOT EXISTS usersprojects.projects (
  projectname varchar(255) NOT NULL,
  PRIMARY KEY(projectname)
);
CREATE TABLE IF NOT EXISTS usersprojects.userprojects (
  userid varchar(255) NOT NULL,
  projectid INT NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES usersprojects.users(email) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_project FOREIGN KEY(projectid) REFERENCES usersprojects.projects(projectname) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(userid, projectid)
);