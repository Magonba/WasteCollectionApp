\c wastecollectiondata;
CREATE TABLE users (
  email varchar(255) NOT NULL,
  PRIMARY KEY(email)
);
CREATE TABLE projects (
  ID INT GENERATED ALWAYS AS IDENTITY,
  projectName varchar(255) NOT NULL,
  PRIMARY KEY(ID)
);
CREATE TABLE userprojects (
  userID varchar(255) NOT NULL,
  projectID INT NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY(userID) REFERENCES users(email) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_project FOREIGN KEY(projectID) REFERENCES projects(ID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(userID, projectID)
);
CREATE TABLE nodes (
  nodeID INT NOT NULL,
  projectID INT NOT NULL,
  xcoordinate INT NOT NULL,
  ycoordinate INT NOT NULL,
  vehicledepot BOOLEAN NOT NULL,
  wastedepot BOOLEAN NOT NULL,
  CONSTRAINT fk_project FOREIGN KEY(projectID) REFERENCES projects(ID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeID, projectID)
);
CREATE TABLE arcs (
  projectsourcenodeID INT NOT NULL,
  sourcenodeID INT NOT NULL,
  projectdestinationnodeID INT NOT NULL CONSTRAINT sameproject CHECK(projectsourcenodeID = projectdestinationnodeID),
  destinationnodeID INT NOT NULL,
  distance INT NOT NULL,
  CONSTRAINT fk_sourcenode FOREIGN KEY(projectsourcenodeID, sourcenodeID) REFERENCES nodes(projectID, nodeID) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_destinationnode FOREIGN KEY(projectdestinationnodeID, destinationnodeID) REFERENCES nodes(projectID, nodeID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(projectsourcenodeID, sourcenodeID, destinationnodeID)
);
CREATE TABLE garbagescenarios (
  title varchar(255) NOT NULL,
  projectID INT NOT NULL,
  CONSTRAINT fk_project FOREIGN KEY(projectID) REFERENCES projects(ID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, projectID)
);
CREATE TABLE garbagescenarioversions (
  title varchar(255) NOT NULL,
  projectID INT NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title, projectID) REFERENCES garbagescenarios(title, projectID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, projectID, timing)
);
CREATE TABLE garbagescenarioversions_nodes_waste (
  nodeID INT NOT NULL,
  projectnodeID INT NOT NULL,
  title varchar(255) NOT NULL,
  projectgarbscID INT NOT NULL CONSTRAINT sameproject CHECK(projectnodeID = projectgarbscID),
  timing TIMESTAMP NOT NULL,
  wasteamount INT NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeID, projectnodeID) REFERENCES nodes(nodeID, projectID) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(title, projectgarbscID, timing) REFERENCES garbagescenarioversions(title, projectID, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeID, projectnodeID, title, timing)
);
CREATE TABLE collectionpointscenarios (
  title varchar(255) NOT NULL,
  projectID INT NOT NULL,
  CONSTRAINT fk_project FOREIGN KEY(projectID) REFERENCES projects(ID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, projectID)
);
CREATE TABLE collectionpointscenarioversions (
  title varchar(255) NOT NULL,
  projectID INT NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title, projectID) REFERENCES collectionpointscenarios(title, projectID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, projectID, timing)
);
CREATE TABLE collectionpointscenarioversions_nodes_potCP (
  nodeID INT NOT NULL,
  projectnodeID INT NOT NULL,
  title varchar(255) NOT NULL,
  projectCPscID INT NOT NULL CONSTRAINT sameproject CHECK(projectnodeID = projectCPscID),
  timing TIMESTAMP NOT NULL,
  potentialcollectionpoint BOOLEAN NOT NULL,
  CONSTRAINT fk_node FOREIGN KEY(nodeID, projectnodeID) REFERENCES nodes(nodeID, projectID) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(title, projectCPscID, timing) REFERENCES collectionpointscenarioversions(title, projectID, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeID, projectnodeID, title, timing)
);
CREATE TABLE vehicletypes (
  title varchar(255) NOT NULL,
  projectID INT NOT NULL,
  averageSpeed INT NOT NULL,
  averageStopTime INT NOT NULL,
  vehicleCapacity INT NOT NULL,
  CONSTRAINT fk_project FOREIGN KEY(projectID) REFERENCES projects(ID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, projectID)
);
CREATE TABLE vehicletypeversions (
  title varchar(255) NOT NULL,
  projectID INT NOT NULL,
  timing TIMESTAMP NOT NULL,
  CONSTRAINT fk_vehicletype FOREIGN KEY(title, projectID) REFERENCES vehicletypes(title, projectID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(title, projectID, timing)
);
CREATE TABLE vehicletypeversions_nodes_activatedarcs (
  projectarcID INT NOT NULL,
  sourcenodeID INT NOT NULL,
  destinationnodeID INT NOT NULL,
  title varchar(255) NOT NULL,
  projectVehicleTypeID INT NOT NULL CONSTRAINT sameproject CHECK(projectarcID = projectVehicleTypeID),
  timing TIMESTAMP NOT NULL,
  activated BOOLEAN NOT NULL,
  CONSTRAINT fk_arc FOREIGN KEY(projectarcID, sourcenodeID, destinationnodeID) REFERENCES arcs(projectsourcenodeID, sourcenodeID, destinationnodeID) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicleType FOREIGN KEY(title, projectVehicleTypeID, timing) REFERENCES vehicletypeversions(title, projectID, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(projectarcID, sourcenodeID, destinationnodeID, title, timing)
);
CREATE TABLE results (
  timing TIMESTAMP NOT NULL,
  titleGarbSc varchar(255) NOT NULL,
  projectGarbScID INT NOT NULL,
  timingGarbSc TIMESTAMP NOT NULL,
  titleCPSc varchar(255) NOT NULL,
  projectCPScID INT NOT NULL CONSTRAINT sameproject CHECK(projectGarbScID = projectCPScID),
  timingCPSc TIMESTAMP NOT NULL,
  model varchar(3) NOT NULL,
  maxWalkingDistance INT NOT NULL,
  totalTime INT NOT NULL,
  CONSTRAINT fk_garbagescenario FOREIGN KEY(titleGarbSc, projectGarbScID, timingGarbSc) REFERENCES garbagescenarioversions(title, projectID, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_collectionpointscenario FOREIGN KEY(titleCPSc, projectCPScID, timingCPSc) REFERENCES collectionpointscenarioversions(title, projectID, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timing, projectGarbScID)
);
CREATE TABLE resultsVehicles (
  timingResult TIMESTAMP NOT NULL,
  projectResultID INT NOT NULL,
  titleVehicleType varchar(255) NOT NULL,
  projectVehicleTypeID INT NOT NULL CONSTRAINT sameproject CHECK(projectResultID = projectVehicleTypeID),
  timingVehicleType TIMESTAMP NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingResult, projectResultID) REFERENCES results(timing, projectGarbScID) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_vehicleType FOREIGN KEY(titleVehicleType, projectVehicleTypeID, timingVehicleType) REFERENCES vehicletypeversions(title, projectID, timing) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(timingResult, projectResultID, titleVehicleType, timingVehicleType)
);
CREATE TABLE tours (
  ID INT GENERATED ALWAYS AS IDENTITY,
  timingResult TIMESTAMP NOT NULL,
  projectResultID INT NOT NULL,
  tourTime INT NOT NULL,
  tourWaste INT NOT NULL,
  CONSTRAINT fk_result FOREIGN KEY(timingResult, projectResultID) REFERENCES results(timing, projectGarbScID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(ID, projectResultID)
);
CREATE TABLE tour_nodes (
  nodeID INT NOT NULL,
  projectnodeID INT NOT NULL,
  tourID INT NOT NULL,
  projectTourID INT NOT NULL CONSTRAINT sameproject CHECK(projectnodeID = projectTourID),
  wasteCollected INT NOT NULL,
  ordering INT NOT NULL, --first, second, third, etc. node in the tour
  CONSTRAINT fk_node FOREIGN KEY(nodeID, projectnodeID) REFERENCES nodes(nodeID, projectID) ON UPDATE CASCADE ON DELETE NO ACTION,
  CONSTRAINT fk_tour FOREIGN KEY(tourID, projectTourID) REFERENCES tours(ID, projectResultID) ON UPDATE CASCADE ON DELETE NO ACTION,
  PRIMARY KEY(nodeID, projectnodeID, tourID)
);
