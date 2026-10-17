#!/bin/sh
# Wraps src/page.html in a full HTML document for GitHub Pages / any static host.
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  sed -n '1,/<\/style>/p' src/page.html
  printf '</head>\n<body>\n'
  sed '1,/<\/style>/d' src/page.html
  printf '</body>\n</html>\n'
} > index.html
