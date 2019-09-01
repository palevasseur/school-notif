### Installation
- Set ~/.aws/credentials file for profile [school-notif-account]
````
[school-notif-account]
aws_access_key_id = xxx
aws_secret_access_key = yyy
````
Note: if run with cron task, must be set on root account

- Launch script on boot using cron task: [sudo crontab -e]