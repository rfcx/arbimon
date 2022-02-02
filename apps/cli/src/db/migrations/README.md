# Migrations

Migrations are executed sequentially. New migrations _must_ be named so that they come _after_ already committed migrations.

Migrations are immutable. They cannot depend on any code that will be changed. You are recommended to minimize imports. The resulting code may be verbose or ugly. However there is little value in refactoring it.
