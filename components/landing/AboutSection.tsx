'use client';

import { ShieldCheck, History, Award, CheckCircle2 } from 'lucide-react';

const ABOUT_STATS = [
  { value: '5,000+', label: 'Pelanggan Puas', sub: 'Mahasiswa & Umum' },
  { value: '250+', label: 'Unit Mobil Aktif', sub: 'Berbagai tipe & kelas' },
  { value: '6 Tahun', label: 'Pengalaman', sub: 'Terpercaya sejak 2020' },
  { value: '99.2%', label: 'Tingkat Kepuasan', sub: 'Berdasarkan survei' },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-4 relative overflow-hidden bg-slate-950 text-white border-t border-slate-900">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Teks Informatif */}
          <div className="space-y-6">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-wider">
              🏢 Tentang RentalMobil
            </span>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Solusi Kepemilikan Mobil <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Terpercaya Sejak 2020
              </span>
            </h2>

            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                Didirikan pada awal tahun 2020 di Yogyakarta, RentalMobil bermula sebagai penyedia jasa sewa mobil harian konvensional bagi mahasiswa. Menyadari tingginya kebutuhan transportasi berjangka panjang dan sulitnya memiliki mobil karena mahalnya DP awal serta syarat kredit konvensional, kami menginisiasi skema <strong>"Sewa Jadi Milik" (Rent-to-Own)</strong>. Misi kami adalah memudahkan semua kalangan, mulai dari driver online, keluarga muda, hingga pelaku wirausaha untuk memiliki kendaraan secara legal, terjangkau, dan aman.
              </p>
              <p>
                Melalui komitmen layanan prima tanpa batas, kami tidak hanya memberikan unit mobil berkualitas siap pakai, tetapi juga paket perlindungan penuh. Kami menangani segala kerepotan kepemilikan mobil tradisional: pembayaran pajak tahunan STNK, pergantian suku cadang yang aus (oli, kampas rem, ban, aki), hingga asuransi Comprehensive (All-Risk) terlengkap. Layanan ini memastikan perjalanan pelanggan kami selalu aman dan bebas dari kekhawatiran finansial mendadak.
              </p>
              <p>
                Hingga kini, RentalMobil telah berkembang pesat dan berhasil menerima penghargaan sebagai <i>"The Most Innovative Automotive Startup"</i> atas terobosannya dalam memberikan skema alternatif kepemilikan kendaraan bermotor yang transparan. Kami bertekad untuk terus memperluas jaringan dan menambah pilihan armada agar dapat memenuhi seluruh kebutuhan mobilitas masyarakat Indonesia.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ShieldCheck size={16} className="text-blue-500" />
                <span>OJK Collaborated Verification</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <History size={16} className="text-blue-500" />
                <span>6+ Tahun Melayani DIY & Sekitarnya</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Award size={16} className="text-blue-500" />
                <span>Award-winning Customer Care</span>
              </div>
            </div>
          </div>

          {/* Right Column - Statistik Grid & Visual */}
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {ABOUT_STATS.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md hover:border-blue-500/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent mb-1.5">
                    {stat.value}
                  </p>
                  <p className="text-sm font-bold text-white mb-0.5">{stat.label}</p>
                  <p className="text-xs text-slate-400">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Visual Box with Tagline & Testi Singkat */}
            <div className="p-8 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-slate-900/60 to-indigo-600/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-full bg-blue-500/20 text-blue-400">
                    <CheckCircle2 size={16} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Pencapaian Terbaik Kami</span>
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-white leading-tight">
                  &ldquo;Mengubah cara orang memiliki mobil secara radikal, adil, dan transparan.&rdquo;
                </h3>
                
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-extrabold text-xs text-white">
                    RM
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Tim RentalMobil</p>
                    <p className="text-[10px] text-slate-400">Yogyakarta Executive Committee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
