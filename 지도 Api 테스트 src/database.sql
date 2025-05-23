create database pothole;
use pothole;
show tables;

create table pothole(
	id int primary key auto_increment,
    x double,
    y double
);

insert into pothole(x, y) values(35.102879, 126.895345);
insert into pothole(x, y) values(35.142831, 127.322133);
insert into pothole(x, y) values(35.128233, 126.942423);
insert into pothole(x, y) values(34.989213, 127.744423);
insert into pothole(x, y) values(35.233423, 127.423323);
