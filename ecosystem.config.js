module.exports = {
    apps: [
        {
            name: "fb-checkpoint",
            script: "./src/app.js",
            watch: false,
            max_memory_restart: '1000M',
            exec_mode: "cluster",
            instances: 1,
            cron_restart: "59 23 * * *"
        }
    ]
}