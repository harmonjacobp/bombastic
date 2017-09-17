exit
touch /var/www/html/a
ls /var/www
ls -l /var/www
exit
touch /var/www/html/a
rm /var/www/html/a
exit
tmux list-sessions
tmux attach-session -t0
exit
