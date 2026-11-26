// Mengimpor modul readline versi promise untuk membaca input dari terminal
import * as readline from "readline/promises";
// Mengimpor stdin (masukan) dan stdout (keluaran) dari proses Node.js
import { stdin as masukan, stdout as keluaran } from "process";


// Interface Tiket: entitas data utama beserta propertinya
interface Tiket {
  id: number; // nomor unik reservasi (number)
  namaPembeli: string; // nama pembeli (string)
  jenisFilm: string; // Action / Comedy / Horror (string)
  jumlahTiket: number; // banyaknya tiket yang dibeli (number)
  statusMember: boolean; // true = member, false = bukan member (boolean)
  metodePembayaran: string; // Tunai / QRIS / Transfer Bank (string)
  totalHarga: number; // harga tiket x jumlah tiket (number)
  diskon: number; // potongan harga dalam rupiah (number)
  totalBayar: number; // total akhir yang harus dibayar (number)
}

// const dipakai untuk nilai tetap yang tidak berubah
const HARGA_ACTION: number = 40000; // harga tiket film Action
const HARGA_COMEDY: number = 35000; // harga tiket film Comedy
const HARGA_HORROR: number = 38000; // harga tiket film Horror
const BIAYA_LAYANAN: number = 2000; // biaya layanan tetap per transaksi
const MAKS_TIKET: number = 10; // batas maksimal tiket per reservasi


// Flowchart: "Siapkan data tiket (awalnya masih kosong)"
const daftarTiket: Tiket[] = []; // array penyimpan seluruh data reservasi
// let dipakai karena nilainya berubah setiap ada reservasi baru
let idBerikutnya: number = 1; // penghitung untuk membuat id unik

// Membuat antarmuka input/output terminal
const rl = readline.createInterface({ input: masukan, output: keluaran });

// Fungsi void tanpa parameter: menampilkan menu utama ke layar
function tampilkanMenu(): void {
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
async function bacaTeksWajib(pesan: string): Promise<string> {
  while (true) {
    const teks: string = (await rl.question(pesan)).trim(); // buang spasi tepi
    // bila tidak kosong, input diterima
    if (teks !== "") {
      return teks;
    }
    console.log("  [!] Input tidak boleh kosong.");
  }
}

// Membaca angka bulat valid dalam rentang min sampai maks
async function bacaAngka(pesan: string, min: number, maks: number): Promise<number> {
  while (true) {
    const teks: string = (await rl.question(pesan)).trim(); // ambil input
    const angka: number = Number(teks); // ubah teks menjadi angka

    // rantai validasi: kosong/NaN, negatif, desimal, di luar rentang
    if (teks === "" || isNaN(angka)) {
      console.log("  [!] Masukkan angka yang valid.");
    } else if (angka < 0) {
      console.log("  [!] Angka tidak boleh negatif.");
    } else if (angka % 1 !== 0) {
      // operator modulus %: sisa bagi bukan 0 berarti bilangan desimal
      console.log("  [!] Masukkan bilangan bulat.");
    } else if (angka < min || angka > maks) {
      // operator logika || : angka di luar batas bawah atau batas atas
      console.log(`  [!] Angka harus antara ${min} dan ${maks}.`);
    } else {
      return angka; // semua validasi lolos
    }
  }
}

// Membaca jawaban Y/N, diulang dengan do...while sampai valid
async function bacaYaTidak(pesan: string): Promise<boolean> {
  let jawab: string = ""; // tempat menyimpan jawaban
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
async function pilihFilm(): Promise<string> {
  console.log(
    `  Pilih film: 1. Action (${formatRupiah(HARGA_ACTION)})  2. Comedy (${formatRupiah(HARGA_COMEDY)})  3. Horror (${formatRupiah(HARGA_HORROR)})`
  );
  const nomor: number = await bacaAngka("  Nomor film (1-3): ", 1, 3); // validasi 1-3
  let film: string = ""; // nama film terpilih
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
async function pilihMetode(): Promise<string> {
  console.log("  Metode bayar: 1. Tunai  2. QRIS  3. Transfer Bank");
  const nomor: number = await bacaAngka("  Nomor metode (1-3): ", 1, 3); // validasi 1-3
  let metode: string = ""; // nama metode terpilih
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
function buatIdUnik(): number {
  // selama id sudah dipakai data lain, naikkan terus penghitungnya
  while (daftarTiket.some((tiket) => tiket.id === idBerikutnya)) {
    idBerikutnya++;
  }
  const idBaru: number = idBerikutnya; // simpan id yang bebas
  idBerikutnya++; // siapkan id untuk reservasi berikutnya
  return idBaru;
}

// CREATE (menu 1): menambah data reservasi baru
async function reservasi(): Promise<void> {
  console.log("\n--- Reservasi Tiket Bioskop ---");

  // ambil semua input, masing-masing sudah divalidasi oleh fungsi bantu
  const nama: string = await bacaTeksWajib("Nama pembeli : ");
  const film: string = await pilihFilm();
  const jumlah: number = await bacaAngka(`Jumlah tiket (1-${MAKS_TIKET}): `, 1, MAKS_TIKET);
  const member: boolean = await bacaYaTidak("Apakah member? (Y/N): ");
  const metode: string = await pilihMetode();

  // susun objek tiket baru dengan id unik
  const tiketBaru: Tiket = susunTiket(buatIdUnik(), nama, film, jumlah, member, metode);

  daftarTiket.push(tiketBaru); // push: simpan tiket baru ke array
  console.log("\n[OK] Reservasi berhasil!");
  tampilkanDetail(tiketBaru);
}

// Fungsi utama: mengulang menu sampai pengguna memilih 0 (Keluar)
async function main(): Promise<void> {
  let berjalan: boolean = true; // penanda loop menu masih berjalan

  // Flowchart: titik (A) -> tampil menu -> input -> cek pilihan -> kembali ke (A)
  while (berjalan) {
    tampilkanMenu(); // flowchart: "Tampilan Menu Utama"
    // flowchart: "Masukkan pilihan menu"
    const pilihan: string = (await rl.question("Masukkan pilihan menu: ")).trim();

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