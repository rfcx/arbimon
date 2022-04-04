If you need to update a proxy `index.ts` (on Mac/Linux):

```
ls *.ts | grep -v "index.ts" | while read object; do; echo "export * from './${object%.*}'"; done | sort > index.ts
```
