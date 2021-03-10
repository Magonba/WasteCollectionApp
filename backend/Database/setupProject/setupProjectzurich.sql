\c wastecollectiondata;
CREATE SCHEMA IF NOT EXISTS zurich;
CREATE TABLE IF NOT EXISTS zurich.nodes (
  nodeid INT NOT NULL,
  xcoordinate INT NOT NULL,
  ycoordinate INT NOT NULL,
  vehicledepot BOOLEAN NOT NULL,
  wastedepot BOOLEAN NOT NULL,
  PRIMARY KEY(nodeid)
);
CREATE TABLE IF NOT EXISTS zurich.arcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  distance INT NOT NULL,
  CONSTRAINT fk_sourcenode FOREIGN KEY(sourcenodeid) REFERENCES zurich.nodes(nodeid) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_destinationnode FOREIGN KEY(destinationnodeid) REFERENCES zurich.nodes(nodeid) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(sourcenodeid, destinationnodeid)
);
CREATE TABLE IF NOT EXISTS zurich.garbagescenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS zurich.garbagescenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title) REFERENCES zurich.garbagescenarios(title) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS zurich.garbagescenarioversions_nodes_waste (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  wasteamount INT NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES zurich.nodes(nodeid) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title, timing) REFERENCES zurich.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS zurich.collectionpointscenarios (
  title varchar(255) NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS zurich.collectionpointscenarioversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title) REFERENCES zurich.collectionpointscenarios(title) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS zurich.collectionpointscenarioversions_nodes_potcp (
  nodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  potentialcollectionpoint BOOLEAN NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES zurich.nodes(nodeid) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title, timing) REFERENCES zurich.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(nodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS zurich.vehicletypes (
  title varchar(255) NOT NULL,
  averagespeed INT NOT NULL,
  averagestoptime INT NOT NULL,
  vehiclecapacity INT NOT NULL,
  PRIMARY KEY(title)
);
CREATE TABLE IF NOT EXISTS zurich.vehicletypeversions (
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title) REFERENCES zurich.vehicletypes(title) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(title, timing)
);
CREATE TABLE IF NOT EXISTS zurich.vehicletypeversions_nodes_activatedarcs (
  sourcenodeid INT NOT NULL,
  destinationnodeid INT NOT NULL,
  title varchar(255) NOT NULL,
  timing TIMESTAMP NOT NULL,
  activated BOOLEAN NOT NULL,
  CONSTRAINT fk_arc FOREIGN KEY(sourcenodeid, destinationnodeid) REFERENCES zurich.arcs(sourcenodeid, destinationnodeid) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title, timing) REFERENCES zurich.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(sourcenodeid, destinationnodeid, title, timing)
);
CREATE TABLE IF NOT EXISTS zurich.results (
  timing TIMESTAMP NOT NULL,
  titlegarbsc varchar(255) NOT NULL,
  timinggarbsc TIMESTAMP NOT NULL,
  titlecpsc varchar(255) NOT NULL,
  timingcpsc TIMESTAMP NOT NULL,
  model varchar(3) NOT NULL,
  maxwalkingdistance INT NOT NULL,
  totaltime INT NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(titlegarbsc, timinggarbsc) REFERENCES zurich.garbagescenarioversions(title, timing) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(titlecpsc, timingcpsc) REFERENCES zurich.collectionpointscenarioversions(title, timing) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(timing)
);
CREATE TABLE IF NOT EXISTS zurich.resultsvehicles (
  timingresult TIMESTAMP NOT NULL,
  titlevehicletype varchar(255) NOT NULL,
  timingvehicletype TIMESTAMP NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES zurich.results(timing) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vehicletype FOREIGN KEY(titlevehicletype, timingvehicletype) REFERENCES zurich.vehicletypeversions(title, timing) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(timingresult, titlevehicletype, timingvehicletype)
);
CREATE TABLE IF NOT EXISTS zurich.tours (
  timing TIMESTAMP NOT NULL,
  timingresult TIMESTAMP NOT NULL,
  tourtime INT NOT NULL,
  tourwaste INT NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingresult) REFERENCES zurich.results(timing) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(timing)
);
CREATE TABLE IF NOT EXISTS zurich.tour_nodes (
  nodeid INT NOT NULL,
  tourtiming TIMESTAMP NOT NULL,
  wastecollected INT NOT NULL,
  ordering INT NOT NULL, --first, second, third, etc. node in the tour
  CONSTRAINT fk_node FOREIGN KEY(nodeid) REFERENCES zurich.nodes(nodeid) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_tour FOREIGN KEY(tourtiming) REFERENCES zurich.tours(timing) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY(nodeid, tourtiming)
);