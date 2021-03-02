\c wastecollectiondata
--go to wastecollectiondata database

--create usersprojects tables
CREATE SCHEMA IF NOT EXISTS usersprojects;
CREATE TABLE IF NOT EXISTS usersprojects.users (
  email varchar(255) NOT NULL,
  admini BOOLEAN NOT NULL,
  passwort varchar(255) NOT NULL,
  PRIMARY KEY(email)
);
CREATE TABLE IF NOT EXISTS usersprojects.projects (
  projectname varchar(255) NOT NULL,
  PRIMARY KEY(projectname)
);
CREATE TABLE IF NOT EXISTS usersprojects.userprojects (
  userid varchar(255) NOT NULL,
  projectid varchar(255) NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(userid) REFERENCES usersprojects.users(email) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_project FOREIGN KEY(projectid) REFERENCES usersprojects.projects(projectname) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(userid, projectid)
);
--for Model testing (in order to test if database reading works properly)
--first create some users
INSERT INTO usersprojects.users VALUES ('a.b@c.de', TRUE, 'secure');
INSERT INTO usersprojects.users VALUES ('e.d@c.ba', FALSE, 'supersecure');
INSERT INTO usersprojects.users VALUES ('f.g@h.ij', FALSE, 'hypersecure');

--second create some projects (just in usersprojects.projects)
INSERT INTO usersprojects.projects VALUES ('fribourg');
INSERT INTO usersprojects.projects VALUES ('Bern');

--third create some user - project connections
INSERT INTO usersprojects.userprojects VALUES ('a.b@c.de', 'fribourg');
INSERT INTO usersprojects.userprojects VALUES ('a.b@c.de', 'Bern');
INSERT INTO usersprojects.userprojects VALUES ('e.d@c.ba', 'fribourg');
INSERT INTO usersprojects.userprojects VALUES ('f.g@h.ij', 'Bern');

--fourth create the corresponding project schemas from second
--fribourg project
CREATE SCHEMA IF NOT EXISTS fribourg;
CREATE TABLE IF NOT EXISTS fribourg.nodes (
  nodeid INT NOT NULL,
  xcoordinate INT NOT NULL,
  ycoordinate INT NOT NULL,
  vehicledepot BOOLEAN NOT NULL,
  wastedepot BOOLEAN NOT NULL,
  PRIMARY KEY(nodeid)
);
CREATE TABLE IF NOT EXISTS fribourg.arcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  distance INT NOT NULL,
  CONSTRAINT fk_sourcenode FOREIGN KEY(sourcenodeid) REFERENCES fribourg.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_destinationnode FOREIGN KEY(destinationnodeid) REFERENCES fribourg.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid)
);
CREATE TABLE IF NOT EXISTS fribourg.garbagescenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS fribourg.garbagescenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title) REFERENCES fribourg.garbagescenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS fribourg.garbagescenarioversions_nodes_waste (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  wasteamount INT NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES fribourg.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title, timing) REFERENCES fribourg.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS fribourg.collectionpointscenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS fribourg.collectionpointscenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title) REFERENCES fribourg.collectionpointscenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS fribourg.collectionpointscenarioversions_nodes_potcp (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  potentialcollectionpoint BOOLEAN NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES fribourg.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title, timing) REFERENCES fribourg.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS fribourg.vehicletypes (
  title varchar(255) NOT NULL,
  averagespeed INT NOT NULL,
  averagestoptime INT NOT NULL,
  vehiclecapacity INT NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS fribourg.vehicletypeversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title) REFERENCES fribourg.vehicletypes(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS fribourg.vehicletypeversions_nodes_activatedarcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  activated BOOLEAN NOT NULL,
  CONSTRAINT fk_arc FOREIGN KEY(sourcenodeid, destinationnodeid) REFERENCES fribourg.arcs(sourcenodeid, destinationnodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title, timing) REFERENCES fribourg.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS fribourg.results (
  timing TIMESTAMP NOT NULL,
  titlegarbsc varchar(255) NOT NULL,
  timinggarbsc TIMESTAMP NOT NULL,
  titlecpsc varchar(255) NOT NULL,
  timingcpsc TIMESTAMP NOT NULL,
  model varchar(3) NOT NULL,
  maxwalkingdistance INT NOT NULL,
  totaltime INT NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(titlegarbsc, timinggarbsc) REFERENCES fribourg.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(titlecpsc, timingcpsc) REFERENCES fribourg.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timing)
);
CREATE TABLE IF NOT EXISTS fribourg.resultsvehicles (
  timingresult TIMESTAMP NOT NULL,
  titlevehicletype varchar(255) NOT NULL,
  timingvehicletype TIMESTAMP NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES fribourg.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(titlevehicletype, timingvehicletype) REFERENCES fribourg.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timingresult, titlevehicletype, timingvehicletype)
);
CREATE TABLE IF NOT EXISTS fribourg.tours (
  id INT NOT NULL,
  timingresult TIMESTAMP NOT NULL,
  tourtime INT NOT NULL,
  tourwaste INT NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES fribourg.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS fribourg.tour_nodes (
  nodeid INT NOT NULL,
  tourid INT NOT NULL,
  wastecollected INT NOT NULL,
  ordering INT NOT NULL, --first, second, third, etc. node in the tour
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES fribourg.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_tour FOREIGN KEY(tourid) REFERENCES fribourg.tours(id) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, tourid)
);

--Bern project
CREATE SCHEMA IF NOT EXISTS Bern;
CREATE TABLE IF NOT EXISTS Bern.nodes (
  nodeid INT NOT NULL,
  xcoordinate INT NOT NULL,
  ycoordinate INT NOT NULL,
  vehicledepot BOOLEAN NOT NULL,
  wastedepot BOOLEAN NOT NULL,
  PRIMARY KEY(nodeid)
);
CREATE TABLE IF NOT EXISTS Bern.arcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  distance INT NOT NULL,
  CONSTRAINT fk_sourcenode FOREIGN KEY(sourcenodeid) REFERENCES Bern.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_destinationnode FOREIGN KEY(destinationnodeid) REFERENCES Bern.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid)
);
CREATE TABLE IF NOT EXISTS Bern.garbagescenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS Bern.garbagescenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title) REFERENCES Bern.garbagescenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS Bern.garbagescenarioversions_nodes_waste (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  wasteamount INT NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES Bern.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title, timing) REFERENCES Bern.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS Bern.collectionpointscenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS Bern.collectionpointscenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title) REFERENCES Bern.collectionpointscenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS Bern.collectionpointscenarioversions_nodes_potcp (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  potentialcollectionpoint BOOLEAN NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES Bern.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title, timing) REFERENCES Bern.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS Bern.vehicletypes (
  title varchar(255) NOT NULL,
  averagespeed INT NOT NULL,
  averagestoptime INT NOT NULL,
  vehiclecapacity INT NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS Bern.vehicletypeversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title) REFERENCES Bern.vehicletypes(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS Bern.vehicletypeversions_nodes_activatedarcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  activated BOOLEAN NOT NULL,
  CONSTRAINT fk_arc FOREIGN KEY(sourcenodeid, destinationnodeid) REFERENCES Bern.arcs(sourcenodeid, destinationnodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title, timing) REFERENCES Bern.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS Bern.results (
  timing TIMESTAMP NOT NULL,
  titlegarbsc varchar(255) NOT NULL,
  timinggarbsc TIMESTAMP NOT NULL,
  titlecpsc varchar(255) NOT NULL,
  timingcpsc TIMESTAMP NOT NULL,
  model varchar(3) NOT NULL,
  maxwalkingdistance INT NOT NULL,
  totaltime INT NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(titlegarbsc, timinggarbsc) REFERENCES Bern.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(titlecpsc, timingcpsc) REFERENCES Bern.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timing)
);
CREATE TABLE IF NOT EXISTS Bern.resultsvehicles (
  timingresult TIMESTAMP NOT NULL,
  titlevehicletype varchar(255) NOT NULL,
  timingvehicletype TIMESTAMP NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES Bern.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(titlevehicletype, timingvehicletype) REFERENCES Bern.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timingresult, titlevehicletype, timingvehicletype)
);
CREATE TABLE IF NOT EXISTS Bern.tours (
  id INT NOT NULL,
  timingresult TIMESTAMP NOT NULL,
  tourtime INT NOT NULL,
  tourwaste INT NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES Bern.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(id)
);
CREATE TABLE IF NOT EXISTS Bern.tour_nodes (
  nodeid INT NOT NULL,
  tourid INT NOT NULL,
  wastecollected INT NOT NULL,
  ordering INT NOT NULL, --first, second, third, etc. node in the tour
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES Bern.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_tour FOREIGN KEY(tourid) REFERENCES Bern.tours(id) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, tourid)
);

--fifth fill up the project schemas tables with some random date
--fill up project fribourg
INSERT INTO fribourg.nodes VALUES (1, 123, 23, TRUE, FALSE);
INSERT INTO fribourg.nodes VALUES (2, 34, 54, TRUE, FALSE);
INSERT INTO fribourg.nodes VALUES (3, 29, 12, FALSE, TRUE);
INSERT INTO fribourg.nodes VALUES (4, 765, 19, FALSE, TRUE);

INSERT INTO fribourg.arcs VALUES (1, 2, 67);
INSERT INTO fribourg.arcs VALUES (2, 3, 40);
INSERT INTO fribourg.arcs VALUES (3, 4, 32);
INSERT INTO fribourg.arcs VALUES (4, 1, 21);

INSERT INTO fribourg.garbagescenarios VALUES ('Summer');
INSERT INTO fribourg.garbagescenarios VALUES ('Winter');

INSERT INTO fribourg.garbagescenarioversions VALUES ('Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.garbagescenarioversions VALUES ('Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.garbagescenarioversions VALUES ('Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.garbagescenarioversions VALUES ('Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (1, 'Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), 567);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (2, 'Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), 735);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (3, 'Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), 903);

INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (1, 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 602);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (2, 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 789);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (3, 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 1043);

INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (1, 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 1567);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (2, 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 7993);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (3, 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 9009);

INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (1, 'Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 2004);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (2, 'Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 8590);
INSERT INTO fribourg.garbagescenarioversions_nodes_waste VALUES (3, 'Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 10780);

INSERT INTO fribourg.collectionpointscenarios VALUES ('SmallContainers');
INSERT INTO fribourg.collectionpointscenarios VALUES ('BigContainers');

INSERT INTO fribourg.collectionpointscenarioversions VALUES ('SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.collectionpointscenarioversions VALUES ('SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.collectionpointscenarioversions VALUES ('BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.collectionpointscenarioversions VALUES ('BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (1, 'SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (2, 'SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (3, 'SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (1, 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (2, 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (3, 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (1, 'BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (2, 'BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (3, 'BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (1, 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (2, 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.collectionpointscenarioversions_nodes_potcp VALUES (3, 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO fribourg.vehicletypes VALUES ('Man20t', 20, 15, 150);
INSERT INTO fribourg.vehicletypes VALUES ('Volkswagen3.5t', 30, 5, 50);

INSERT INTO fribourg.vehicletypeversions VALUES ('Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.vehicletypeversions VALUES ('Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.vehicletypeversions VALUES ('Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.vehicletypeversions VALUES ('Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO fribourg.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO fribourg.results VALUES (TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 'K1', 798, 324);
INSERT INTO fribourg.results VALUES (TO_TIMESTAMP('2007-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'K3', 912, 451);

INSERT INTO fribourg.resultsvehicles VALUES (TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.resultsvehicles VALUES (TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO fribourg.resultsvehicles VALUES (TO_TIMESTAMP('2007-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO fribourg.tours VALUES (1, TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 123, 874);
INSERT INTO fribourg.tours VALUES (2, TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 543, 1093);
INSERT INTO fribourg.tours VALUES (3, TO_TIMESTAMP('2007-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 732, 9874);

INSERT INTO fribourg.tour_nodes VALUES (1, 1, 209, 1);
INSERT INTO fribourg.tour_nodes VALUES (2, 1, 190, 2);
INSERT INTO fribourg.tour_nodes VALUES (3, 1, 409, 3);

INSERT INTO fribourg.tour_nodes VALUES (1, 2, 323, 3);
INSERT INTO fribourg.tour_nodes VALUES (2, 2, 376, 2);
INSERT INTO fribourg.tour_nodes VALUES (3, 2, 312, 1);

INSERT INTO fribourg.tour_nodes VALUES (1, 3, 367, 3);
INSERT INTO fribourg.tour_nodes VALUES (2, 3, 309, 1);
INSERT INTO fribourg.tour_nodes VALUES (3, 3, 412, 2);

--Bern project (same as fribourg because lazy)
INSERT INTO Bern.nodes VALUES (1, 123, 23, TRUE, FALSE);
INSERT INTO Bern.nodes VALUES (2, 34, 54, TRUE, FALSE);
INSERT INTO Bern.nodes VALUES (3, 29, 12, FALSE, TRUE);
INSERT INTO Bern.nodes VALUES (4, 765, 19, FALSE, TRUE);

INSERT INTO Bern.arcs VALUES (1, 2, 67);
INSERT INTO Bern.arcs VALUES (2, 3, 40);
INSERT INTO Bern.arcs VALUES (3, 4, 32);
INSERT INTO Bern.arcs VALUES (4, 1, 21);

INSERT INTO Bern.garbagescenarios VALUES ('Summer');
INSERT INTO Bern.garbagescenarios VALUES ('Winter');

INSERT INTO Bern.garbagescenarioversions VALUES ('Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.garbagescenarioversions VALUES ('Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.garbagescenarioversions VALUES ('Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.garbagescenarioversions VALUES ('Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (1, 'Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), 567);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (2, 'Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), 735);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (3, 'Summer', TO_TIMESTAMP('2017-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), 903);

INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (1, 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 602);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (2, 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 789);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (3, 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 1043);

INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (1, 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 1567);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (2, 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 7993);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (3, 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 9009);

INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (1, 'Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 2004);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (2, 'Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 8590);
INSERT INTO Bern.garbagescenarioversions_nodes_waste VALUES (3, 'Winter', TO_TIMESTAMP('2020-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 10780);

INSERT INTO Bern.collectionpointscenarios VALUES ('SmallContainers');
INSERT INTO Bern.collectionpointscenarios VALUES ('BigContainers');

INSERT INTO Bern.collectionpointscenarioversions VALUES ('SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.collectionpointscenarioversions VALUES ('SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.collectionpointscenarioversions VALUES ('BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.collectionpointscenarioversions VALUES ('BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (1, 'SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (2, 'SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (3, 'SmallContainers', TO_TIMESTAMP('2016-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (1, 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (2, 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (3, 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (1, 'BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (2, 'BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (3, 'BigContainers', TO_TIMESTAMP('2014-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (1, 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (2, 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.collectionpointscenarioversions_nodes_potcp VALUES (3, 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO Bern.vehicletypes VALUES ('Man20t', 20, 15, 150);
INSERT INTO Bern.vehicletypes VALUES ('Volkswagen3.5t', 30, 5, 50);

INSERT INTO Bern.vehicletypeversions VALUES ('Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.vehicletypeversions VALUES ('Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.vehicletypeversions VALUES ('Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.vehicletypeversions VALUES ('Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Man20t', TO_TIMESTAMP('2012-03-31 9:30:20', 'YYYY-MM-DD HH:MI:SS'), FALSE);

INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), FALSE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Volkswagen3.5t', TO_TIMESTAMP('2010-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (1, 2, 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (2, 3, 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);
INSERT INTO Bern.vehicletypeversions_nodes_activatedarcs VALUES (3, 4, 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), TRUE);

INSERT INTO Bern.results VALUES (TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Summer', TO_TIMESTAMP('2018-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 'SmallContainers', TO_TIMESTAMP('2015-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'), 'K1', 798, 324);
INSERT INTO Bern.results VALUES (TO_TIMESTAMP('2007-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Winter', TO_TIMESTAMP('2019-07-29 7:21:32', 'YYYY-MM-DD HH:MI:SS'), 'BigContainers', TO_TIMESTAMP('2013-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'K3', 912, 451);

INSERT INTO Bern.resultsvehicles VALUES (TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.resultsvehicles VALUES (TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Volkswagen3.5t', TO_TIMESTAMP('2009-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'));
INSERT INTO Bern.resultsvehicles VALUES (TO_TIMESTAMP('2007-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 'Man20t', TO_TIMESTAMP('2011-05-21 10:45:30', 'YYYY-MM-DD HH:MI:SS'));

INSERT INTO Bern.tours VALUES (1, TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 123, 874);
INSERT INTO Bern.tours VALUES (2, TO_TIMESTAMP('2008-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 543, 1093);
INSERT INTO Bern.tours VALUES (3, TO_TIMESTAMP('2007-06-11 3:25:11', 'YYYY-MM-DD HH:MI:SS'), 732, 9874);

INSERT INTO Bern.tour_nodes VALUES (1, 1, 209, 1);
INSERT INTO Bern.tour_nodes VALUES (2, 1, 190, 2);
INSERT INTO Bern.tour_nodes VALUES (3, 1, 409, 3);

INSERT INTO Bern.tour_nodes VALUES (1, 2, 323, 3);
INSERT INTO Bern.tour_nodes VALUES (2, 2, 376, 2);
INSERT INTO Bern.tour_nodes VALUES (3, 2, 312, 1);

INSERT INTO Bern.tour_nodes VALUES (1, 3, 367, 3);
INSERT INTO Bern.tour_nodes VALUES (2, 3, 309, 1);
INSERT INTO Bern.tour_nodes VALUES (3, 3, 412, 2);
