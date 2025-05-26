create database pothole;
use pothole;


create table road(
	road_id int primary key auto_increment,
    road_lastdate datetime default current_timestamp,
    road_lastfixdate datetime default null,
    road_danger double,
    road_count int,
    road_state text
);
create table pothole(
	pothole_id int primary key auto_increment,
    road_id int,
    pothole_depth double,
    pothole_width double,
    pothole_latitude double,
    pothole_longtitude double,
    pothole_date datetime default current_timestamp,
    FOREIGN KEY (road_id) REFERENCES road(road_id)
);


insert into road(road_danger, road_count, road_state) values(2.4, 1, "good");
insert into road(road_danger, road_count, road_state) values(3.2, 1, "bad");
insert into road(road_danger, road_count, road_state) values(5, 1, "bad");
insert into road(road_danger, road_count, road_state) values(1.2, 1, "good");
insert into road(road_danger, road_count, road_state) values(1.2, 1, "good");

insert into pothole(road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longtitude) values(1, 1.1, 1.2, 35.102879, 126.895345);
insert into pothole(road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longtitude) values(2, 1.7, 4.2, 35.142831, 127.322133);
insert into pothole(road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longtitude) values(3, 5, 1.4, 35.128233, 126.942423);
insert into pothole(road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longtitude) values(4, 0.6, 1.2, 34.989213, 127.744423);
insert into pothole(road_id, pothole_depth, pothole_width, pothole_latitude, pothole_longtitude) values(5, 0.5, 1.1, 35.233423, 127.423323);
