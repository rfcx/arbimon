-- arbimon2.projects definition

CREATE TABLE `projects` (
  `project_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `description` text,
  `project_type_id` int(10) unsigned NOT NULL,
  `is_private` tinyint(1) NOT NULL,
  `is_enabled` tinyint(4) NOT NULL DEFAULT '1',
  `current_plan` int(10) unsigned DEFAULT NULL,
  `storage_usage` float DEFAULT NULL,
  `processing_usage` float DEFAULT NULL,
  `pattern_matching_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `citizen_scientist_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `cnn_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `aed_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `clustering_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `external_id` varchar(12) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `reports_enabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `url` (`url`),
  KEY `project_type_id` (`project_type_id`),
  KEY `current_plan` (`current_plan`),
  CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`project_type_id`) REFERENCES `project_types` (`project_type_id`),
  CONSTRAINT `projects_ibfk_3` FOREIGN KEY (`current_plan`) REFERENCES `project_plans` (`plan_id`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1921 DEFAULT CHARSET=utf8;

-- arbimon2.sites definition

CREATE TABLE `sites` (
  `site_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `site_type_id` int(10) unsigned NOT NULL,
  `project_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `lat` double NOT NULL,
  `lon` double NOT NULL,
  `alt` double NOT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '0',
  `token_created_on` bigint(20) unsigned DEFAULT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `timezone` varchar(255) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`site_id`),
  KEY `site_type_id` (`site_type_id`),
  KEY `project_id` (`project_id`),
  KEY `name` (`name`) USING BTREE,
  CONSTRAINT `sites_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
  CONSTRAINT `sites_ibfk_2` FOREIGN KEY (`site_type_id`) REFERENCES `site_types` (`site_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8529 DEFAULT CHARSET=utf8;

-- arbimon2.species definition

CREATE TABLE `species` (
  `species_id` int(11) NOT NULL AUTO_INCREMENT,
  `scientific_name` varchar(100) NOT NULL,
  `code_name` varchar(10) DEFAULT NULL,
  `taxon_id` int(11) NOT NULL,
  `family_id` int(11) DEFAULT NULL,
  `image` varchar(200) DEFAULT NULL,
  `description` text,
  `biotab_id` int(11) DEFAULT NULL,
  `defined_by` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`species_id`),
  UNIQUE KEY `scientific_name` (`scientific_name`),
  KEY `taxon_id` (`taxon_id`),
  KEY `code_name` (`code_name`),
  KEY `biotab_id` (`biotab_id`),
  KEY `family_id` (`family_id`),
  KEY `defined_by` (`defined_by`),
  CONSTRAINT `species_ibfk_1` FOREIGN KEY (`taxon_id`) REFERENCES `species_taxons` (`taxon_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `species_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `species_families` (`family_id`) ON DELETE CASCADE,
  CONSTRAINT `species_ibfk_3` FOREIGN KEY (`defined_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48592 DEFAULT CHARSET=utf8;

-- arbimon2.project_classes definition

CREATE TABLE `project_classes` (
  `project_class_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int(11) unsigned NOT NULL,
  `species_id` int(11) NOT NULL,
  `songtype_id` int(11) NOT NULL,
  PRIMARY KEY (`project_class_id`),
  UNIQUE KEY `project_id` (`project_id`,`species_id`,`songtype_id`),
  KEY `species_id` (`species_id`),
  KEY `songtype_id` (`songtype_id`),
  CONSTRAINT `project_classes_ibfk_1` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON DELETE CASCADE,
  CONSTRAINT `project_classes_ibfk_2` FOREIGN KEY (`songtype_id`) REFERENCES `songtypes` (`songtype_id`) ON DELETE CASCADE,
  CONSTRAINT `project_classes_ibfk_3` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4349 DEFAULT CHARSET=utf8;

-- arbimon2.recordings definition

CREATE TABLE `recordings` (
  `recording_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `site_id` int(10) unsigned NOT NULL,
  `uri` varchar(255) NOT NULL,
  `datetime` datetime NOT NULL,
  `mic` varchar(255) NOT NULL,
  `recorder` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `sample_rate` mediumint(8) unsigned DEFAULT NULL,
  `precision` tinyint(3) unsigned DEFAULT NULL,
  `duration` float DEFAULT NULL,
  `samples` bigint(20) unsigned DEFAULT NULL,
  `file_size` bigint(45) DEFAULT NULL,
  `bit_rate` varchar(45) DEFAULT NULL,
  `sample_encoding` varchar(45) DEFAULT NULL,
  `upload_time` datetime DEFAULT NULL,
  `meta` text,
  `datetime_utc` datetime DEFAULT NULL,
  PRIMARY KEY (`recording_id`),
  UNIQUE KEY `unique_uri` (`uri`),
  KEY `site_id` (`site_id`),
  KEY `recs_by_upload_time` (`upload_time`,`site_id`),
  KEY `recordings_site_datetime_local_idx` (`site_id`),
  CONSTRAINT `recordings_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7050281 DEFAULT CHARSET=utf8;

-- arbimon2.recordings definition

CREATE TABLE `recordings` (
  `recording_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `site_id` int(10) unsigned NOT NULL,
  `uri` varchar(255) NOT NULL,
  `datetime` datetime NOT NULL,
  `mic` varchar(255) NOT NULL,
  `recorder` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `sample_rate` mediumint(8) unsigned DEFAULT NULL,
  `precision` tinyint(3) unsigned DEFAULT NULL,
  `duration` float DEFAULT NULL,
  `samples` bigint(20) unsigned DEFAULT NULL,
  `file_size` bigint(45) DEFAULT NULL,
  `bit_rate` varchar(45) DEFAULT NULL,
  `sample_encoding` varchar(45) DEFAULT NULL,
  `upload_time` datetime DEFAULT NULL,
  `meta` text,
  `datetime_utc` datetime DEFAULT NULL,
  PRIMARY KEY (`recording_id`),
  UNIQUE KEY `unique_uri` (`uri`),
  KEY `site_id` (`site_id`),
  KEY `recs_by_upload_time` (`upload_time`,`site_id`),
  KEY `recordings_site_datetime_local_idx` (`site_id`),
  CONSTRAINT `recordings_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`site_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7050281 DEFAULT CHARSET=utf8;

-- arbimon2.templates definition

CREATE TABLE `templates` (
  `template_id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(10) unsigned NOT NULL,
  `recording_id` bigint(20) unsigned NOT NULL,
  `species_id` int(11) NOT NULL,
  `songtype_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `uri` varchar(255) DEFAULT NULL,
  `x1` double NOT NULL,
  `y1` double NOT NULL,
  `x2` double NOT NULL,
  `y2` double NOT NULL,
  `date_created` timestamp NULL DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  `source_project_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`template_id`),
  KEY `fk_templates_1_idx` (`project_id`),
  KEY `fk_templates_2_idx` (`recording_id`),
  KEY `fk_templates_3_idx` (`species_id`),
  KEY `fk_templates_4_idx` (`songtype_id`),
  KEY `fk_source_project_id` (`source_project_id`),
  KEY `templates_name_date_created` (`project_id`,`deleted`,`name`,`date_created`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_source_project_id` FOREIGN KEY (`source_project_id`) REFERENCES `projects` (`project_id`),
  CONSTRAINT `fk_templates_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_templates_2` FOREIGN KEY (`recording_id`) REFERENCES `recordings` (`recording_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_templates_3` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_templates_4` FOREIGN KEY (`songtype_id`) REFERENCES `songtypes` (`songtype_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=975 DEFAULT CHARSET=latin1;

