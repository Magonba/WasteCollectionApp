\c wastecollectiondata;
CREATE SCHEMA REPLACEWITHPROJECTNAME;
CREATE TABLE REPLACEWITHPROJECTNAME.nodes (
  nodeid INT NOT NULL,
  xcoordinate INT NOT NULL,
  ycoordinate INT NOT NULL,
  vehicledepot BOOLEAN NOT NULL,
  wastedepot BOOLEAN NOT NULL,
  PRIMARY KEY(nodeid)
);
CREATE TABLE REPLACEWITHPROJECTNAME.arcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  distance INT NOT NULL,
  CONSTRAINT fk_sourcenode FOREIGN KEY(sourcenodeid) REFERENCES REPLACEWITHPROJECTNAME.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_destinationnode FOREIGN KEY(destinationnodeid) REFERENCES REPLACEWITHPROJECTNAME.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid)
);
CREATE TABLE REPLACEWITHPROJECTNAME.garbagescenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE REPLACEWITHPROJECTNAME.garbagescenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title) REFERENCES REPLACEWITHPROJECTNAME.garbagescenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE REPLACEWITHPROJECTNAME.garbagescenarioversions_nodes_waste (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  wasteamount INT NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES REPLACEWITHPROJECTNAME.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title, timing) REFERENCES REPLACEWITHPROJECTNAME.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE REPLACEWITHPROJECTNAME.collectionpointscenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE REPLACEWITHPROJECTNAME.collectionpointscenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title) REFERENCES REPLACEWITHPROJECTNAME.collectionpointscenarios(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE REPLACEWITHPROJECTNAME.collectionpointscenarioversions_nodes_potcp (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  potentialcollectionpoint BOOLEAN NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES REPLACEWITHPROJECTNAME.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title, timing) REFERENCES REPLACEWITHPROJECTNAME.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE REPLACEWITHPROJECTNAME.vehicletypes (
  title varchar(255) NOT NULL,
  averagespeed INT NOT NULL,
  averagestoptime INT NOT NULL,
  vehiclecapacity INT NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE REPLACEWITHPROJECTNAME.vehicletypeversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title) REFERENCES REPLACEWITHPROJECTNAME.vehicletypes(title) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, timing)
);
CREATE TABLE REPLACEWITHPROJECTNAME.vehicletypeversions_nodes_activatedarcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  activated BOOLEAN NOT NULL,
  CONSTRAINT fk_arc FOREIGN KEY(sourcenodeid, destinationnodeid) REFERENCES REPLACEWITHPROJECTNAME.arcs(sourcenodeid, destinationnodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title, timing) REFERENCES REPLACEWITHPROJECTNAME.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(sourcenodeid, destinationnodeid, title, timing)
);
CREATE TABLE REPLACEWITHPROJECTNAME.results (
  timing TIMESTAMP NOT NULL,
  titlegarbsc varchar(255) NOT NULL,
  timinggarbsc TIMESTAMP NOT NULL,
  titlecpsc varchar(255) NOT NULL,
  timingcpsc TIMESTAMP NOT NULL,
  model varchar(3) NOT NULL,
  maxwalkingdistance INT NOT NULL,
  totaltime INT NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(titlegarbsc, timinggarbsc) REFERENCES REPLACEWITHPROJECTNAME.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(titlecpsc, timingcpsc) REFERENCES REPLACEWITHPROJECTNAME.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timing)
);
CREATE TABLE REPLACEWITHPROJECTNAME.resultsvehicles (
  timingresult TIMESTAMP NOT NULL,
  titlevehicletype varchar(255) NOT NULL,
  timingvehicletype TIMESTAMP NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES REPLACEWITHPROJECTNAME.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicletype FOREIGN KEY(titlevehicletype, timingvehicletype) REFERENCES REPLACEWITHPROJECTNAME.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timingresult, titlevehicletype, timingvehicletype)
);
CREATE TABLE REPLACEWITHPROJECTNAME.tours (
  id INT GENERATED ALWAYS AS IDENTITY,
  timingresult TIMESTAMP NOT NULL,
  tourtime INT NOT NULL,
  tourwaste INT NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES REPLACEWITHPROJECTNAME.results(timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(id)
);
CREATE TABLE REPLACEWITHPROJECTNAME.tour_nodes (
  nodeid INT NOT NULL,
  tourid INT NOT NULL,
  wastecollected INT NOT NULL,
  ordering INT NOT NULL, --first, second, third, etc. node in the tour
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES REPLACEWITHPROJECTNAME.nodes(nodeid) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_tour FOREIGN KEY(tourid) REFERENCES REPLACEWITHPROJECTNAME.tours(id) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeid, tourid)
);