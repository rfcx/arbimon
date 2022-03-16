# Biodiversity > Database

Start database container (using `-d` to start it in the background)

```
pnpm serve
```

See the logs

```
pnpm logs
```

Stop database container

```
pnpm stop
```

If you change the scripts in `init.d`, you must delete the volume to force them to execute again (this will also delete all tables & data in your database):

```
pnpm reset
```
