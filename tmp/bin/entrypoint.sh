#!/usr/bin/dumb-init /bin/sh
# 
# env 变量，请传入下面参数，也可以不传！
# REDIS_TYPE= server|sentinel
# REDIS_LOGLEVEL= debug|verbose|notice|warning
#
ulimit -n 65535
. /bin/init_redis
# 创建用户
# /usr/bin/setcap "cap_net_bind_service=+ep" /usr/bin/php-fpm
# setcap "cap_net_bind_service=+ep" /usr/sbin/php-fpm7

init_redis_config

formatOutput "Begin startup REDIS app for user [\033[31m${REDIS_USER}\033[0m]....."
printOK $?
su-exec ${REDIS_USER}:${REDIS_USER} ${REDIS_INSTALL}/bin/redis-server ${REDIS_CONFIG}
