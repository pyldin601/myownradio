FROM rust:1.87 AS devenv

ARG USER=1000:1000

WORKDIR /code/


FROM rust:1.87 AS build

WORKDIR /code/

COPY Cargo.toml ./
COPY Cargo.lock ./
COPY src ./src

RUN cargo build --release

FROM rust:1.87

COPY --from=build /code/target/release/radiomanager-web-egress-controller /radiomanager-web-egress-controller

CMD /radiomanager-web-egress-controller
