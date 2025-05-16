use diesel_async::pooled_connection::{deadpool, AsyncDieselConnectionManager};
use diesel_async::AsyncMysqlConnection;

#[derive(Clone)]
pub(crate) struct DbPool {
    pool: deadpool::Pool<AsyncMysqlConnection>,
}

impl DbPool {
    pub(crate) fn create(username: &str, password: &str, hostname: &str, database: &str) -> Self {
        let connection_url = format!("mysql://{username}:{password}@{hostname}/{database}");
        let config = AsyncDieselConnectionManager::<AsyncMysqlConnection>::new(connection_url);
        let pool = deadpool::Pool::builder(config)
            .build()
            .expect("Failed to create pool");

        Self { pool }
    }

    pub(crate) async fn get_connection(
        &self,
    ) -> Result<deadpool::Object<AsyncMysqlConnection>, deadpool::PoolError> {
        self.pool.get().await
    }
}
