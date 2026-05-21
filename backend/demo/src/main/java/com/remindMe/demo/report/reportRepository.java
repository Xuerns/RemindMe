package com.remindMe.demo.report;

import org.springframework.data.jpa.repository.JpaRepository;

public interface reportRepository extends JpaRepository<reportEntity, String> {
}