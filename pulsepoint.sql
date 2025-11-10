-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 10, 2025 at 08:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pulsepoint`
--

-- --------------------------------------------------------

--
-- Table structure for table `apikey`
--

CREATE TABLE `apikey` (
  `id` int(11) NOT NULL,
  `apikey` varchar(255) NOT NULL,
  `created_at` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `apikey`
--

INSERT INTO `apikey` (`id`, `apikey`, `created_at`) VALUES
(1, '69f27e98-52c0-47cc-a855-4f7ea7fc9846', '2025-11-08 05:59:23.840017');

-- --------------------------------------------------------

--
-- Table structure for table `appliedhardwares`
--

CREATE TABLE `appliedhardwares` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hardware_id` int(11) NOT NULL,
  `apply_date` varchar(255) DEFAULT NULL,
  `is_apply` int(11) DEFAULT NULL,
  `purchase_date` varchar(255) DEFAULT NULL,
  `periodicity` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `serial_numbers` varchar(255) DEFAULT NULL,
  `special_price` varchar(255) DEFAULT NULL,
  `contract_number` varchar(255) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appliedprojects`
--

CREATE TABLE `appliedprojects` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `apply_date` varchar(255) DEFAULT NULL,
  `is_apply` int(11) DEFAULT NULL,
  `purchase_date` varchar(255) DEFAULT NULL,
  `periodicity` int(11) DEFAULT NULL,
  `user_count` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `id` int(11) NOT NULL,
  `registration` varchar(255) DEFAULT NULL,
  `software` varchar(255) DEFAULT NULL,
  `serialNumber` varchar(255) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `activeCode` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faq`
--

CREATE TABLE `faq` (
  `id` int(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faq`
--

INSERT INTO `faq` (`id`, `title`, `filename`) VALUES
(5, 'dasdas', 'faq_2c8e3c9c38fc48bda1caecdb9889ac46_DOC20251019WA0109.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `hardwares`
--

CREATE TABLE `hardwares` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` varchar(255) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `is_rent` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hardwares`
--

INSERT INTO `hardwares` (`id`, `name`, `description`, `price`, `filename`, `is_rent`) VALUES
(1, 'Sample Hardware', 'A sample hardware item', '50.00', 'hardware.png', 0);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `website_link` varchar(255) DEFAULT NULL,
  `price` varchar(255) DEFAULT NULL,
  `mprice` varchar(255) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support`
--

CREATE TABLE `support` (
  `id` int(20) NOT NULL,
  `ticket_id` int(20) NOT NULL,
  `user_id` int(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longblob DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `flag` int(11) NOT NULL,
  `created_at` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `hotelname` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `phonenumber` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 0,
  `isVerify` int(11) DEFAULT 0,
  `role` int(11) DEFAULT 1,
  `uniqueString` varchar(255) DEFAULT NULL,
  `verifyCode` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `company`, `hotelname`, `firstname`, `lastname`, `phonenumber`, `email`, `address`, `contact`, `password`, `status`, `isVerify`, `role`, `uniqueString`, `verifyCode`) VALUES
(24, 'Clinotag', 'Clinotag', 'gergory', 'william', '12345678', 'maestro@clinotag.com', 'a', 'maestro@clinotag.com', '$pbkdf2-sha256$29000$f6.1tpZS6n3PGYNQKiVkrA$bY0ybPVLiRYGLFhb66Dtmi7YT2LTjqVJFl7ZchG1RMM', 0, 1, 0, NULL, '903124');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `apikey`
--
ALTER TABLE `apikey`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appliedhardwares`
--
ALTER TABLE `appliedhardwares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_hardware` (`user_id`,`hardware_id`),
  ADD KEY `idx_user_hardware` (`user_id`,`hardware_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_hardware_id` (`hardware_id`);

--
-- Indexes for table `appliedprojects`
--
ALTER TABLE `appliedprojects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_project` (`user_id`,`project_id`),
  ADD KEY `idx_user_project` (`user_id`,`project_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_project_id` (`project_id`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_serialNumber` (`serialNumber`),
  ADD KEY `idx_activeCode` (`activeCode`);

--
-- Indexes for table `faq`
--
ALTER TABLE `faq`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hardwares`
--
ALTER TABLE `hardwares`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `support`
--
ALTER TABLE `support`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hotelname` (`hotelname`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_hotelname` (`hotelname`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `apikey`
--
ALTER TABLE `apikey`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `appliedhardwares`
--
ALTER TABLE `appliedhardwares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appliedprojects`
--
ALTER TABLE `appliedprojects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faq`
--
ALTER TABLE `faq`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hardwares`
--
ALTER TABLE `hardwares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `support`
--
ALTER TABLE `support`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appliedhardwares`
--
ALTER TABLE `appliedhardwares`
  ADD CONSTRAINT `appliedhardwares_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appliedhardwares_ibfk_2` FOREIGN KEY (`hardware_id`) REFERENCES `hardwares` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `appliedprojects`
--
ALTER TABLE `appliedprojects`
  ADD CONSTRAINT `appliedprojects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appliedprojects_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
