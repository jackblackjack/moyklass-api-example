#!/bin/env bash

# Vars.
postgres_ver=10
postgres_etc_path=/etc/postgresql/${postgres_ver}/main/

# Allow connections from anywhere.
sudo sed -i -e"s/^#listen_addresses =.*$/listen_addresses = '*'/" ${postgres_etc_path}/postgresql.conf
sudo echo "host    all    all    0.0.0.0/0    md5" >> ${postgres_etc_path}/pg_hba.conf

# Configure logs.
sudo sed -i -e"s/^#logging_collector = off.*$/logging_collector = on/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_directory = 'pg_log'.*$/log_directory = '\/var\/log\/postgresql'/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_filename = 'postgresql-\%Y-\%m-\%d_\%H\%M\%S.log'.*$/log_filename = 'postgresql_\%a.log'/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_file_mode = 0600.*$/log_file_mode = 0644/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_truncate_on_rotation = off.*$/log_truncate_on_rotation = on/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_rotation_age = 1d.*$/log_rotation_age = 1d/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_min_duration_statement = -1.*$/log_min_duration_statement = 0/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_checkpoints = off.*$/log_checkpoints = on/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_connections = off.*$/log_connections = on/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_disconnections = off.*$/log_disconnections = on/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^log_line_prefix = '\%t \[\%p-\%l\] \%q\%u@\%d '.*$/log_line_prefix = '\%t \[\%p\]: \[\%l-1\] user=\%u,db=\%d'/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_lock_waits = off.*$/log_lock_waits = on/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#log_temp_files = -1.*$/log_temp_files = 0/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#statement_timeout = 0.*$/statement_timeout = 1800000        # in milliseconds, 0 is disabled (current 30min)/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^lc_messages = 'en_US.UTF-8'.*$/lc_messages = 'C'/" ${postgres_etc_path}/postgresql.conf

# Performance Tuning
sudo sed -i -e"s/^max_connections = 10.*$/max_connections = 20/" ${postgres_etc_path}/postgresql.conf
sudo sed -i -e"s/^#max_wal_senders = 10.*$/max_wal_senders = 10/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^shared_buffers =.*$/shared_buffers = 2GB/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^#effective_cache_size = 128MB.*$/effective_cache_size = 64MB/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^#work_mem = 1MB.*$/work_mem = 2MB/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^#maintenance_work_mem = 16MB.*$/maintenance_work_mem = 8MB/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^#checkpoint_segments = .*$/checkpoint_segments = 16/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^#checkpoint_completion_target = 0.5.*$/checkpoint_completion_target = 0.3/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^#wal_buffers =.*$/wal_buffers = 16MB/" ${postgres_etc_path}/postgresql.conf
#sudo sed -i -e"s/^#default_statistics_target = 100.*$/default_statistics_target = 100/" ${postgres_etc_path}/postgresql.conf

sudo service postgresql restart
