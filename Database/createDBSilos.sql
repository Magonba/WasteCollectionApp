\c wastecollectiondata;
CREATE SCHEMA usersprojects;
CREATE TABLE usersprojects.users (
  email varchar(255) NOT NULL,
  PRIMARY KEY(email)
);
CREATE TABLE usersprojects.projects (
  id INT GENERATED ALWAYS AS IDENTITY,
  projectname varchar(255) NOT NULL,
  PRIMARY KEY(id)
);
CREATE TABLE usersprojects.userprojects (
  userid varchar(255) NOT NULL,
  projectid INT NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES usersprojects.users(email) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_project FOREIGN KEY(projectid) REFERENCES usersprojects.projects(id) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(userid, projectid)
);
CREATE SCHEMA project1;
CREATE TABLE project1.nodes (
  nodeid INT NOT NULL,
  xcoordinate INT NOT NULL,
  ycoordinate INT NOT NULL,
  vehicledepot BOOLEAN NOT NULL,
  wastedepot BOOLEAN NOT NULL,
  PRIMARY KEY(nodeid)
);
CREATE TABLE project1.arcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  distance INT NOT NULL,
  CONSTRAINT fk_sourcenode FOREIGN KEY(sourcenodeid) REFERENCES project1.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_destinationnode FOREIGN KEY(destinationnodeid) REFERENCES project1.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid)
);
CREATE TABLE project1.garbagescenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE project1.garbagescenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title) REFERENCES project1.garbagescenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE project1.garbagescenarioversions_nodes_waste (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  wasteamount INT NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES project1.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title, timing) REFERENCES project1.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE project1.collectionpointscenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE project1.collectionpointscenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title) REFERENCES project1.collectionpointscenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE project1.collectionpointscenarioversions_nodes_potcp (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  potentialcollectionpoint BOOLEAN NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES project1.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title, timing) REFERENCES project1.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE project1.vehicletypes (
  title varchar(255) NOT NULL,
  averagespeed INT NOT NULL,
  averagestoptime INT NOT NULL,
  vehiclecapacity INT NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE project1.vehicletypeversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title) REFERENCES project1.vehicletypes(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE project1.vehicletypeversions_nodes_activatedarcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  activated BOOLEAN NOT NULL,
  CONSTRAINT fk_arc FOREIGN KEY(sourcenodeid, destinationnodeid) REFERENCES project1.arcs(sourcenodeid, destinationnodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title, timing) REFERENCES project1.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid, title, timing)
);
CREATE TABLE project1.results (
  timing TIMESTAMP NOT NULL,
  titlegarbsc varchar(255) NOT NULL,
  timinggarbsc TIMESTAMP NOT NULL,
  titlecpsc varchar(255) NOT NULL,
  timingcpsc TIMESTAMP NOT NULL,
  model varchar(3) NOT NULL,
  maxwalkingdistance INT NOT NULL,
  totaltime INT NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(titlegarbsc, timinggarbsc) REFERENCES project1.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(titlecpsc, timingcpsc) REFERENCES project1.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timing)
);
CREATE TABLE project1.resultsvehicles (
  timingresult TIMESTAMP NOT NULL,
  titlevehicletype varchar(255) NOT NULL,
  timingvehicletype TIMESTAMP NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES project1.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(titlevehicletype, timingvehicletype) REFERENCES project1.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timingresult, titlevehicletype, timingvehicletype)
);
CREATE TABLE project1.tours (
  id INT GENERATED ALWAYS AS IDENTITY,
  timingresult TIMESTAMP NOT NULL,
  tourtime INT NOT NULL,
  tourwaste INT NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES project1.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(id)
);
CREATE TABLE project1.tour_nodes (
  nodeid INT NOT NULL,
  tourid INT NOT NULL,
  wastecollected INT NOT NULL,
  ordering INT NOT NULL, --first, second, third, etc. node in the tour
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES project1.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_tour FOREIGN KEY(tourid) REFERENCES project1.tours(id) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, tourid)
);