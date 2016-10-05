# Maintainer: Peter Mount <peter@retep.org>

pkgname="nrod-timetable"
pkgver="0.2"
pkgrel="3"
pkgdesc="Area51 Network Rail Timetable"
arch="x86_64"
url="https://area51.onl/"
license="ASL 2.0"
source=""
subpackages="$pkgname-dev"
depends="libarea51 libarea51-rest libarea51-httpd json-c libmicrohttpd curl libxml2"
depends_dev="libarea51-dev libarea51-rest-dev libarea51-httpd-dev json-c-dev libmicrohttpd-dev curl-dev libxml2-dev"
#triggers="$pkgname-bin.trigger=/lib:/usr/lib:/usr/glibc-compat/lib"

builddeps() {
  sudo apk add $depends $depends_dev
}

package() {
  autoconf
  ./configure
  make clean
  make -j1
  mkdir -p "$pkgdir/usr/bin"
  cp -rp build/package/usr/bin/* "$pkgdir/usr/bin"
  mkdir -p "$pkgdir/usr/lib"
  cp -rp build/package/usr/lib/* "$pkgdir/usr/lib"
}

dev() {
# depends="$pkgname $depends_dev"
  mkdir -p "$subpkgdir/usr/include"
  cp -rp build/package/usr/include/* "$subpkgdir/usr/include"
}
