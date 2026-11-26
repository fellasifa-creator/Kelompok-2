"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Mengimpor modul readline versi promise untuk membaca input dari terminal
const readline = __importStar(require("readline/promises"));
// Mengimpor stdin (masukan) dan stdout (keluaran) dari proses Node.js
const process_1 = require("process");
// const dipakai untuk nilai tetap yang tidak berubah
const HARGA_ACTION = 40000; // harga tiket film Action
const HARGA_COMEDY = 35000; // harga tiket film Comedy
const HARGA_HORROR = 38000; // harga tiket film Horror
const BIAYA_LAYANAN = 2000; // biaya layanan tetap per transaksi
const MAKS_TIKET = 10; // batas maksimal tiket per reservasi
// Flowchart: "Siapkan data tiket (awalnya masih kosong)"
const daftarTiket = []; // array penyimpan seluruh data reservasi
// let dipakai karena nilainya berubah setiap ada reservasi baru
let idBerikutnya = 1; // penghitung untuk membuat id unik
// Membuat antarmuka input/output terminal
const rl = readline.createInterface({ input: process_1.stdin, output: process_1.stdout });
// Fungsi void tanpa parameter: menampilkan menu utama ke layar
function tampilkanMenu() {
    console.log("\n====== SISTEM RESERVASI TIKET BIOSKOP ======");
    console.log("1. Reservasi");
    console.log("2. Lihat Data Reservasi");
    console.log("3. Ubah Data Reservasi");
    console.log("4. Hapus Data Reservasi");
    console.log("5. Cari Data Reservasi");
    console.log("0. Keluar");
    console.log("============================================");
}
// Membaca teks dari pengguna, diulang terus sampai tidak kosong
async function bacaTeksWajib(pesan) {
    while (true) {
        const teks = (await rl.question(pesan)).trim(); // buang spasi tepi
        // bila tidak kosong, input diterima
        if (teks !== "") {
            return teks;
        }
        console.log("  [!] Input tidak boleh kosong.");
    }
}
// Membaca angka bulat valid dalam rentang min sampai maks
async function bacaAngka(pesan, min, maks) {
    while (true) {
        const teks = (await rl.question(pesan)).trim(); // ambil input
        const angka = Number(teks); // ubah teks menjadi angka
        // rantai validasi: kosong/NaN, negatif, desimal, di luar rentang
        if (teks === "" || isNaN(angka)) {
            console.log("  [!] Masukkan angka yang valid.");
        }
        else if (angka < 0) {
            console.log("  [!] Angka tidak boleh negatif.");
        }
        else if (angka % 1 !== 0) {
            // operator modulus %: sisa bagi bukan 0 berarti bilangan desimal
            console.log("  [!] Masukkan bilangan bulat.");
        }
        else if (angka < min || angka > maks) {
            // operator logika || : angka di luar batas bawah atau batas atas
            console.log(`  [!] Angka harus antara ${min} dan ${maks}.`);
        }
        else {
            return angka; // semua validasi lolos
        }
    }
}
// Membaca jawaban Y/N, diulang dengan do...while sampai valid
async function bacaYaTidak(pesan) {
    let jawab = ""; // tempat menyimpan jawaban
    do {
        jawab = (await rl.question(pesan)).trim().toUpperCase(); // jadikan huruf besar
        // bila bukan Y dan bukan N, minta input ulang
        if (jawab !== "Y" && jawab !== "N") {
            console.log("  [!] Ketik Y atau N.");
        }
    } while (jawab !== "Y" && jawab !== "N");
    return jawab === "Y"; // true bila jawabannya Y
}
// Menampilkan pilihan film, lalu mengubah nomor pilihan menjadi nama film
async function pilihFilm() {
    console.log(`  Pilih film: 1. Action (${formatRupiah(HARGA_ACTION)})  2. Comedy (${formatRupiah(HARGA_COMEDY)})  3. Horror (${formatRupiah(HARGA_HORROR)})`);
    const nomor = await bacaAngka("  Nomor film (1-3): ", 1, 3); // validasi 1-3
    let film = ""; // nama film terpilih
    // switch 3 case + default untuk memetakan nomor ke nama film
    switch (nomor) {
        case 1:
            film = "Action";
            break;
        case 2:
            film = "Comedy";
            break;
        case 3:
            film = "Horror";
            break;
        default:
            film = "Action";
            break;
    }
    return film;
}
// Menampilkan pilihan metode bayar, lalu mengubah nomor menjadi nama metode
async function pilihMetode() {
    console.log("  Metode bayar: 1. Tunai  2. QRIS  3. Transfer Bank");
    const nomor = await bacaAngka("  Nomor metode (1-3): ", 1, 3); // validasi 1-3
    let metode = ""; // nama metode terpilih
    // switch 3 case + default untuk memetakan nomor ke nama metode
    switch (nomor) {
        case 1:
            metode = "Tunai";
            break;
        case 2:
            metode = "QRIS";
            break;
        case 3:
            metode = "Transfer Bank";
            break;
        default:
            metode = "Tunai";
            break;
    }
    return metode;
}
// Fungsi membuat id unik agar tidak ada id kembar
function buatIdUnik() {
    // selama id sudah dipakai data lain, naikkan terus penghitungnya
    while (daftarTiket.some((tiket) => tiket.id === idBerikutnya)) {
        idBerikutnya++;
    }
    const idBaru = idBerikutnya; // simpan id yang bebas
    idBerikutnya++; // siapkan id untuk reservasi berikutnya
    return idBaru;
}
// CREATE (menu 1): menambah data reservasi baru
async function reservasi() {
    console.log("\n--- Reservasi Tiket Bioskop ---");
    // ambil semua input, masing-masing sudah divalidasi oleh fungsi bantu
    const nama = await bacaTeksWajib("Nama pembeli : ");
    const film = await pilihFilm();
    const jumlah = await bacaAngka(`Jumlah tiket (1-${MAKS_TIKET}): `, 1, MAKS_TIKET);
    const member = await bacaYaTidak("Apakah member? (Y/N): ");
    const metode = await pilihMetode();
    // susun objek tiket baru dengan id unik
    const tiketBaru = susunTiket(buatIdUnik(), nama, film, jumlah, member, metode);
    daftarTiket.push(tiketBaru); // push: simpan tiket baru ke array
    console.log("\n[OK] Reservasi berhasil!");
    tampilkanDetail(tiketBaru);
}
// Fungsi utama: mengulang menu sampai pengguna memilih 0 (Keluar)
async function main() {
    let berjalan = true; // penanda loop menu masih berjalan
    // Flowchart: titik (A) -> tampil menu -> input -> cek pilihan -> kembali ke (A)
    while (berjalan) {
        tampilkanMenu(); // flowchart: "Tampilan Menu Utama"
        // flowchart: "Masukkan pilihan menu"
        const pilihan = (await rl.question("Masukkan pilihan menu: ")).trim();
        // flowchart: percabangan "Pilihan menu?"
        switch (pilihan) {
            case "1":
                await reservasi(); // Reservasi (Create)
                break;
            case "2":
                await lihatData(); // Lihat Data Reservasi (Read)
                break;
            case "3":
                await ubahData(); // Ubah Data Reservasi (Update)
                break;
            case "4":
                await hapusData(); // Hapus Data Reservasi (Delete)
                break;
            case "5":
                await cariData(); // Cari Data Reservasi (Search)
                break;
            case "0":
                // flowchart: "Tampilkan: terima kasih (selesai)" lalu End
                console.log("\nTerima kasih telah menggunakan sistem reservasi tiket bioskop.");
                berjalan = false; // hentikan loop menu
                break;
            default:
                // flowchart: cabang "Lainnya" -> "pilihan tidak valid", kembali ke menu
                console.log("\n[!] Pilihan tidak valid, silakan coba lagi.");
                break;
        }
    }
    rl.close(); // tutup input terminal (flowchart: End)
}
// Fungsi mencari posisi (index) data berdasar id, -1 bila tidak ada
function cariIndexById(id) {
    // findIndex mencari elemen pertama yang id-nya sama (operator ===)
    return daftarTiket.findIndex((tiket) => tiket.id === id);
}
// Menampilkan daftar data dalam bentuk tabel rapi
function tampilkanTabel(data) {
    // bila array kosong, tampilkan pesan lalu hentikan fungsi
    if (data.length === 0) {
        console.log("  (tidak ada data untuk ditampilkan)");
        return;
    }
    // cetak judul kolom dan garis pemisah
    console.log("\nID  | Nama Pembeli         | Film   | Jml | Member | Metode        | Total Bayar");
    console.log("-".repeat(88));
    // for...of: menelusuri setiap tiket untuk dicetak per baris
    for (const t of data) {
        const member = !t.statusMember ? "Tidak" : "Ya"; // operator logika !
        console.log(`${String(t.id).padEnd(3)} | ${t.namaPembeli.padEnd(20)} | ${t.jenisFilm.padEnd(6)} | ` +
            `${String(t.jumlahTiket).padEnd(3)} | ${member.padEnd(6)} | ${t.metodePembayaran.padEnd(13)} | ${formatRupiah(t.totalBayar)}`);
    }
    // for biasa: menjumlahkan seluruh total bayar memakai index
    let rataRata = 0; // penampung jumlah, nanti dibagi menjadi rata-rata
    for (let i = 0; i < data.length; i++) {
        rataRata += data[i].totalBayar; // compound += : tambahkan total bayar ke-i
    }
    rataRata /= data.length; // compound /= : bagi jumlah dengan banyak data
    console.log("-".repeat(88));
    console.log(`Jumlah data: ${data.length} | Rata-rata total bayar: ${formatRupiah(Math.round(rataRata))}`);
}
// Menampilkan detail lengkap satu tiket beserta rincian perhitungannya
function tampilkanDetail(t) {
    // operator aritmatika: -, /, dan + dipakai untuk rincian pembayaran
    const setelahDiskon = t.totalHarga - t.diskon; // total dikurangi diskon
    const persenHemat = (t.diskon / t.totalHarga) * 100; // persen potongan harga
    const totalAkhir = setelahDiskon + BIAYA_LAYANAN; // tambah biaya layanan
    console.log("\n--- Detail Pembelian Tiket ---");
    console.log(`ID               : ${t.id}`);
    console.log(`Nama Pembeli     : ${t.namaPembeli}`);
    console.log(`Jenis Film       : ${t.jenisFilm}`);
    console.log(`Harga Tiket      : ${formatRupiah(tentukanHarga(t.jenisFilm))}`);
    console.log(`Jumlah Tiket     : ${t.jumlahTiket}`);
    console.log(`Status Member    : ${t.statusMember ? "Member" : "Bukan Member"}`);
    console.log(`Metode Pembayaran: ${t.metodePembayaran}`);
    console.log(`Total Harga      : ${formatRupiah(t.totalHarga)}`);
    console.log(`Diskon           : ${formatRupiah(t.diskon)} (${persenHemat.toFixed(0)}%)`);
    console.log(`Biaya Layanan    : ${formatRupiah(BIAYA_LAYANAN)}`);
    console.log(`Total Bayar      : ${formatRupiah(totalAkhir)}`);
}
// READ (menu 2): menampilkan seluruh data dan detail satu data berdasar id
async function lihatData() {
    // pesan khusus bila belum ada data
    if (daftarTiket.length === 0) {
        console.log("\n[!] Belum ada data reservasi.");
        return;
    }
    tampilkanTabel(daftarTiket); // tampilkan seluruh data
    // tawarkan melihat detail satu data
    const lihatDetail = await bacaYaTidak("\nLihat detail satu data? (Y/N): ");
    if (lihatDetail) {
        const id = await bacaAngka("Masukkan ID: ", 0, 999999);
        // find: mencari satu tiket berdasar id
        const hasil = daftarTiket.find((t) => t.id === id);
        if (hasil !== undefined) {
            tampilkanDetail(hasil); // data ketemu
        }
        else {
            console.log(`[!] Data dengan ID ${id} tidak ditemukan.`);
        }
    }
}
// UPDATE (menu 3): mengubah data berdasar id, kolom boleh dilewati
async function ubahData() {
    // pesan khusus bila belum ada data
    if (daftarTiket.length === 0) {
        console.log("\n[!] Belum ada data reservasi.");
        return;
    }
    tampilkanTabel(daftarTiket); // tampilkan data agar pengguna bisa memilih id
    const id = await bacaAngka("\nMasukkan ID yang akan diubah: ", 0, 999999);
    const index = cariIndexById(id); // cari posisi data
    // nested tingkat 1: cek apakah id ditemukan
    if (index !== -1) {
        const t = daftarTiket[index]; // data lama
        console.log("\nNilai lama ada di dalam [ ]. Kosongkan (Enter) untuk melewati.");
        // nama: Enter = pertahankan nilai lama
        let nama = t.namaPembeli;
        const namaBaru = (await rl.question(`Nama pembeli [${t.namaPembeli}]: `)).trim();
        if (namaBaru !== "") {
            nama = namaBaru;
        }
        // film: ubah hanya bila pengguna menjawab Y
        let film = t.jenisFilm;
        if (await bacaYaTidak(`Ubah jenis film [${t.jenisFilm}]? (Y/N): `)) {
            film = await pilihFilm();
        }
        // jumlah tiket: Enter = lewati, selain itu divalidasi
        let jumlah = t.jumlahTiket;
        const jumlahTeks = (await rl.question(`Jumlah tiket [${t.jumlahTiket}]: `)).trim();
        // nested tingkat 2: ada input baru atau tidak
        if (jumlahTeks !== "") {
            const jumlahBaru = Number(jumlahTeks);
            // nested tingkat 3: validasi angka (bukan NaN, bulat, dalam rentang)
            if (!isNaN(jumlahBaru) && jumlahBaru % 1 === 0 && jumlahBaru >= 1 && jumlahBaru <= MAKS_TIKET) {
                jumlah = jumlahBaru; // nilai baru valid
            }
            else {
                console.log("  [!] Jumlah tidak valid, nilai lama dipertahankan.");
            }
        }
        // status member: ubah hanya bila pengguna menjawab Y
        let member = t.statusMember;
        if (await bacaYaTidak(`Ubah status member [${t.statusMember ? "Member" : "Bukan Member"}]? (Y/N): `)) {
            member = await bacaYaTidak("Apakah member? (Y/N): ");
        }
        // metode pembayaran: ubah hanya bila pengguna menjawab Y
        let metode = t.metodePembayaran;
        if (await bacaYaTidak(`Ubah metode pembayaran [${t.metodePembayaran}]? (Y/N): `)) {
            metode = await pilihMetode();
        }
        // susun ulang tiket (harga & diskon dihitung ulang) lalu timpa data lama
        daftarTiket[index] = susunTiket(t.id, nama, film, jumlah, member, metode);
        console.log("\n[OK] Data berhasil diubah.");
        tampilkanDetail(daftarTiket[index]);
    }
    else {
        console.log(`[!] Data dengan ID ${id} tidak ditemukan.`);
    }
}
// Fungsi dengan parameter dan return number: menentukan harga berdasar film
function tentukanHarga(jenisFilm) {
    let harga = 0; // nilai awal bila film tidak dikenal
    // switch dengan 3 case + default untuk memilih harga sesuai jenis film
    switch (jenisFilm) {
        case "Action":
            harga = HARGA_ACTION; // film Action
            break;
        case "Comedy":
            harga = HARGA_COMEDY; // film Comedy
            break;
        case "Horror":
            harga = HARGA_HORROR; // film Horror
            break;
        default:
            break; // film tidak dikenal, harga tetap 0
    }
    return harga; // kembalikan harga tiket
}
// Fungsi return number: menghitung diskon berdasar jumlah tiket & status member
function hitungDiskon(total, jumlah, member) {
    let persen = 0; // persentase diskon, awalnya 0 (tanpa diskon)
    // if majemuk (operator && ): 3 tiket atau lebih dan member -> diskon 10%
    if (jumlah >= 3 && member) {
        persen = 0.1;
    }
    else if (jumlah >= 3 && !member) {
        // 3 tiket atau lebih tetapi bukan member -> diskon 5%
        persen = 0.05;
    }
    return total * persen; // diskon = total x persentase
}
// Fungsi return number: menghitung total bayar memakai operator compound
function hitungTotalBayar(total, diskon) {
    let bayar = total; // mulai dari total harga
    bayar -= diskon; // compound -= : kurangi dengan diskon
    bayar += BIAYA_LAYANAN; // compound += : tambah biaya layanan
    return bayar; // kembalikan total yang harus dibayar
}
// Arrow function: mengubah angka menjadi format rupiah, contoh Rp40.000
const formatRupiah = (angka) => {
    return "Rp" + angka.toLocaleString("id-ID");
};
// Fungsi menyusun objek Tiket lengkap beserta hasil perhitungan harga
function susunTiket(id, nama, film, jumlah, member, metode) {
    const harga = tentukanHarga(film); // harga satuan sesuai film
    let total = harga; // mulai dari harga satuan
    total *= jumlah; // compound *= : kalikan dengan jumlah tiket
    const diskon = hitungDiskon(total, jumlah, member); // hitung diskon
    const bayar = hitungTotalBayar(total, diskon); // hitung total bayar
    // kembalikan objek tiket yang sudah lengkap
    return {
        id: id,
        namaPembeli: nama,
        jenisFilm: film,
        jumlahTiket: jumlah,
        statusMember: member,
        metodePembayaran: metode,
        totalHarga: total,
        diskon: diskon,
        totalBayar: bayar,
    };
}
// DELETE (menu 4): menghapus data berdasar id dengan konfirmasi Y/N
async function hapusData() {
    // pesan khusus bila belum ada data
    if (daftarTiket.length === 0) {
        console.log("\n[!] Belum ada data reservasi.");
        return;
    }
    tampilkanTabel(daftarTiket); // tampilkan data agar pengguna bisa memilih id
    const id = await bacaAngka("\nMasukkan ID yang akan dihapus: ", 0, 999999);
    const index = cariIndexById(id); // cari posisi data
    if (index === -1) {
        console.log(`[!] Data dengan ID ${id} tidak ditemukan.`);
    }
    else {
        tampilkanDetail(daftarTiket[index]); // tunjukkan data yang akan dihapus
        const yakin = await bacaYaTidak("\nYakin hapus data ini? (Y/N): ");
        if (yakin) {
            daftarTiket.splice(index, 1); // splice: buang 1 elemen pada posisi index
            // nested tingkat 3: pastikan data benar-benar sudah hilang dari array
            if (cariIndexById(id) === -1) {
                console.log("[OK] Data berhasil dihapus.");
            }
        }
        else {
            console.log("Penghapusan dibatalkan.");
        }
    }
}
// SEARCH (menu 5): cari kata kunci nama + filter film + filter member
async function cariData() {
    // pesan khusus bila belum ada data
    if (daftarTiket.length === 0) {
        console.log("\n[!] Belum ada data reservasi.");
        return;
    }
    console.log("\n--- Cari Data Reservasi ---");
    // kata kunci diubah ke huruf kecil agar pencarian tidak sensitif huruf besar/kecil
    const kunci = (await rl.question("Kata kunci nama pembeli (Enter = semua): ")).trim().toLowerCase();
    console.log("Filter film   : 0. Semua  1. Action  2. Comedy  3. Horror");
    const pilFilm = await bacaAngka("Pilih filter film (0-3): ", 0, 3);
    console.log("Filter member : 0. Semua  1. Member  2. Bukan Member");
    const pilMember = await bacaAngka("Pilih filter member (0-2): ", 0, 2);
    // daftar nama film; index 0 kosong karena 0 berarti "semua"
    const namaFilm = ["", "Action", "Comedy", "Horror"];
    // filter: ambil hanya tiket yang cocok dengan kata kunci dan kedua filter
    const hasil = daftarTiket.filter((t) => {
        const cocokKunci = kunci === "" || t.namaPembeli.toLowerCase().includes(kunci);
        const cocokFilm = pilFilm === 0 || t.jenisFilm === namaFilm[pilFilm];
        const cocokMember = pilMember === 0 || (pilMember === 1 && t.statusMember) || (pilMember === 2 && !t.statusMember);
        return cocokKunci && cocokFilm && cocokMember; // harus cocok semuanya
    });
    // tampilkan jumlah hasil, atau pesan bila tidak ada yang cocok
    if (hasil.length > 0) {
        console.log(`\nDitemukan ${hasil.length} data:`);
        tampilkanTabel(hasil);
    }
    else {
        console.log("\n[!] Data tidak ditemukan.");
    }
}
// Memulai program (flowchart: Start)
main();
//# sourceMappingURL=index.js.map