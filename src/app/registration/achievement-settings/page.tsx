"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Award, Save, Undo2, Shield, Settings, Info, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFromLocalStorage } from "@/lib/localStorage";
import { getAchievementSettings, saveAchievementSettings, resetAchievementSettings, type AchievementSettings } from "@/lib/achievementSettingsService";

export default function AchievementSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [settings, setSettings] = React.useState<AchievementSettings | null>(null);

  React.useEffect(() => {
    const creds = getFromLocalStorage<any>('loginCredentials', null);
    if (!creds || creds.role !== 'superadmin') {
      router.replace('/registration/home');
      return;
    }
    setSettings(getAchievementSettings());
  }, [router]);

  if (!settings) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Memuat konfigurasi prestasi...</p>
      </div>
    );
  }

  const handleActiveToggle = (key: keyof AchievementSettings) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: {
        ...settings[key],
        active: !settings[key].active
      }
    });
  };

  const handleScoreChange = (categoryKey: keyof AchievementSettings, scoreKey: string, val: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [categoryKey]: {
        ...settings[categoryKey],
        scores: {
          ...settings[categoryKey].scores,
          [scoreKey]: val
        }
      }
    });
  };

  const handleSave = () => {
    if (!settings) return;
    saveAchievementSettings(settings);
    toast({
      title: "Pengaturan Disimpan",
      description: "Aturan poin dan kategori prestasi berhasil diperbarui.",
    });
  };

  const handleReset = () => {
    const defaults = resetAchievementSettings();
    setSettings(defaults);
    toast({
      title: "Reset Berhasil",
      description: "Aturan prestasi dikembalikan ke standar awal pemerintah.",
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" /> Pengaturan Bobot Prestasi
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sebagai Superadmin, Anda dapat mengaktifkan/menonaktifkan jenis prestasi serta menyesuaikan bobot nilai poin masing-masing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-9">
            <Undo2 className="mr-2 h-4 w-4" /> Reset ke Default
          </Button>
          <Button size="sm" onClick={handleSave} className="h-9">
            <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
          </Button>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-sm">
        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold mb-1">Informasi Kebijakan Nilai:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Siswa hanya diperbolehkan mengklaim prestasi yang aktif di dropdown pendaftaran.</li>
            <li>Jika kategori dinonaktifkan, siswa tidak dapat memilih jenis prestasi tersebut saat mengisi data.</li>
            <li>Bobot nilai dihitung secara dinamis sesuai isian yang dimasukkan siswa secara real-time.</li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="akademik" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="akademik">Prestasi Akademik</TabsTrigger>
          <TabsTrigger value="non-akademik">Prestasi Non-Akademik</TabsTrigger>
        </TabsList>

        {/* TAB 1: PRESTASI AKADEMIK */}
        <TabsContent value="akademik" className="space-y-6 mt-4">
          
          {/* JUARA KELAS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Juara Kelas (Nilai Rapor)</CardTitle>
                <CardDescription className="text-xs">Bobot nilai berdasarkan peringkat juara kelas per semester</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active-rapor" 
                  checked={settings.rapor.active} 
                  onCheckedChange={() => handleActiveToggle('rapor')} 
                />
                <Label htmlFor="active-rapor" className="text-xs font-semibold cursor-pointer">
                  {settings.rapor.active ? 'Aktif' : 'Nonaktif'}
                </Label>
              </div>
            </CardHeader>
            {settings.rapor.active && (
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* VII */}
                  <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold text-primary uppercase">Kelas VII Ganjil/Genap</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 1</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.vii_juara_1} onChange={(e) => handleScoreChange('rapor', 'vii_juara_1', Number(e.target.value))} />
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 2</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.vii_juara_2} onChange={(e) => handleScoreChange('rapor', 'vii_juara_2', Number(e.target.value))} />
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 3</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.vii_juara_3} onChange={(e) => handleScoreChange('rapor', 'vii_juara_3', Number(e.target.value))} />
                      </div>
                    </div>
                  </div>

                  {/* VIII */}
                  <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold text-primary uppercase">Kelas VIII Ganjil/Genap</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 1</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.viii_juara_1} onChange={(e) => handleScoreChange('rapor', 'viii_juara_1', Number(e.target.value))} />
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 2</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.viii_juara_2} onChange={(e) => handleScoreChange('rapor', 'viii_juara_2', Number(e.target.value))} />
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 3</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.viii_juara_3} onChange={(e) => handleScoreChange('rapor', 'viii_juara_3', Number(e.target.value))} />
                      </div>
                    </div>
                  </div>

                  {/* IX */}
                  <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold text-primary uppercase">Kelas IX Ganjil</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 1</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.ix_juara_1} onChange={(e) => handleScoreChange('rapor', 'ix_juara_1', Number(e.target.value))} />
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 2</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.ix_juara_2} onChange={(e) => handleScoreChange('rapor', 'ix_juara_2', Number(e.target.value))} />
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <Label className="text-xs">Juara 3</Label>
                        <Input type="number" className="w-20 text-right h-8" value={settings.rapor.scores.ix_juara_3} onChange={(e) => handleScoreChange('rapor', 'ix_juara_3', Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* TKA */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Tes Kemampuan Akademik (TKA)</CardTitle>
                <CardDescription className="text-xs">Bobot nilai TKA tertinggi di tingkat sekolah asal</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active-tka" 
                  checked={settings.tka.active} 
                  onCheckedChange={() => handleActiveToggle('tka')} 
                />
                <Label htmlFor="active-tka" className="text-xs font-semibold cursor-pointer">
                  {settings.tka.active ? 'Aktif' : 'Nonaktif'}
                </Label>
              </div>
            </CardHeader>
            {settings.tka.active && (
              <CardContent className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium">Peringkat 1</Label>
                    <Input type="number" className="text-right h-9" value={settings.tka.scores.peringkat_1} onChange={(e) => handleScoreChange('tka', 'peringkat_1', Number(e.target.value))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium">Peringkat 2</Label>
                    <Input type="number" className="text-right h-9" value={settings.tka.scores.peringkat_2} onChange={(e) => handleScoreChange('tka', 'peringkat_2', Number(e.target.value))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium">Peringkat 3</Label>
                    <Input type="number" className="text-right h-9" value={settings.tka.scores.peringkat_3} onChange={(e) => handleScoreChange('tka', 'peringkat_3', Number(e.target.value))} />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* LOMBA AKADEMIK (OFFICIAL & OTHER) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lomba Akademik (Sains & Teknologi)</CardTitle>
              <CardDescription className="text-xs">Mengatur kejuaraan tingkat Kabupaten s.d Internasional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Official Organizers */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-primary">A. Penyelenggara Resmi (Kemendikbud/Kemenag/KONI/Kwarnas)</h4>
                  <div className="flex items-center space-x-2">
                    <Switch id="active-lomba-official" checked={settings.lomba_official.active} onCheckedChange={() => handleActiveToggle('lomba_official')} />
                    <Label htmlFor="active-lomba-official" className="text-xs cursor-pointer">{settings.lomba_official.active ? 'Aktif' : 'Nonaktif'}</Label>
                  </div>
                </div>
                {settings.lomba_official.active && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border">
                    {['kabupaten', 'provinsi', 'nasional', 'internasional'].map(lvl => (
                      <div key={lvl} className="space-y-2 border-r last:border-0 pr-2">
                        <p className="text-xs font-bold capitalize text-muted-foreground">{lvl}</p>
                        <div className="space-y-1.5">
                          {['1', '2', '3'].map(rank => {
                            const key = `${lvl}_juara_${rank}`;
                            return (
                              <div key={rank} className="flex justify-between items-center text-xs">
                                <span>J-{rank}</span>
                                <Input type="number" className="w-14 text-right h-7 text-xs px-1" value={settings.lomba_official.scores[key]} onChange={(e) => handleScoreChange('lomba_official', key, Number(e.target.value))} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Organizers */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-primary">B. Penyelenggara Swasta / Lembaga Lain</h4>
                  <div className="flex items-center space-x-2">
                    <Switch id="active-lomba-other" checked={settings.lomba_other.active} onCheckedChange={() => handleActiveToggle('lomba_other')} />
                    <Label htmlFor="active-lomba-other" className="text-xs cursor-pointer">{settings.lomba_other.active ? 'Aktif' : 'Nonaktif'}</Label>
                  </div>
                </div>
                {settings.lomba_other.active && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-lg border">
                    {['provinsi', 'nasional', 'internasional'].map(lvl => (
                      <div key={lvl} className="space-y-2 border-r last:border-0 pr-2">
                        <p className="text-xs font-bold capitalize text-muted-foreground">{lvl}</p>
                        <div className="space-y-1.5">
                          {['1', '2', '3'].map(rank => {
                            const key = `${lvl}_juara_${rank}`;
                            return (
                              <div key={rank} className="flex justify-between items-center text-xs">
                                <span>J-{rank}</span>
                                <Input type="number" className="w-14 text-right h-7 text-xs px-1" value={settings.lomba_other.scores[key]} onChange={(e) => handleScoreChange('lomba_other', key, Number(e.target.value))} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-center p-2 text-center text-xs text-muted-foreground border rounded bg-muted/10">
                      💡 Tingkat Kab/Kota untuk swasta bernilai 0 (tidak diakui).
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PRESTASI NON-AKADEMIK */}
        <TabsContent value="non-akademik" className="space-y-6 mt-4">
          
          {/* OSIS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Kepengurusan Organisasi (OSIS/PMR/MPK/dll.)</CardTitle>
                <CardDescription className="text-xs">Bobot nilai pengalaman kepengurusan sebagai Ketua</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active-osis" checked={settings.osis.active} onCheckedChange={() => handleActiveToggle('osis')} />
                <Label htmlFor="active-osis" className="text-xs font-semibold cursor-pointer">{settings.osis.active ? 'Aktif' : 'Nonaktif'}</Label>
              </div>
            </CardHeader>
            {settings.osis.active && (
              <CardContent className="pt-2">
                <div className="flex items-center justify-between max-w-sm">
                  <Label className="text-sm font-medium">Nilai Tambahan Ketua Organisasi</Label>
                  <Input type="number" className="w-24 text-right h-9" value={settings.osis.scores.ketua} onChange={(e) => handleScoreChange('osis', 'ketua', Number(e.target.value))} />
                </div>
              </CardContent>
            )}
          </Card>

          {/* TAHFIDZ */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Penghafal Al-Qur'an (Tahfidz)</CardTitle>
                <CardDescription className="text-xs">Bobot nilai berdasarkan jumlah Juz yang dihafal</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active-tahfidz" checked={settings.tahfidz.active} onCheckedChange={() => handleActiveToggle('tahfidz')} />
                <Label htmlFor="active-tahfidz" className="text-xs font-semibold cursor-pointer">{settings.tahfidz.active ? 'Aktif' : 'Nonaktif'}</Label>
              </div>
            </CardHeader>
            {settings.tahfidz.active && (
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const juz = idx + 1;
                  const key = `juz_${juz}`;
                  return (
                    <div key={key} className="flex justify-between items-center p-2 rounded border bg-muted/20 text-xs">
                      <span>{juz === 8 ? '>= 8 Juz' : `${juz} Juz`}</span>
                      <Input type="number" className="w-14 text-right h-7 px-1 text-xs" value={settings.tahfidz.scores[key]} onChange={(e) => handleScoreChange('tahfidz', key, Number(e.target.value))} />
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>

          {/* KEAGAMAAN NON-ISLAM */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Keagamaan Non-Islam</CardTitle>
                <CardDescription className="text-xs">Bobot prestasi membaca kitab suci / lektor dll.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active-non_islam" checked={settings.non_islam.active} onCheckedChange={() => handleActiveToggle('non_islam')} />
                <Label htmlFor="active-non_islam" className="text-xs font-semibold cursor-pointer">{settings.non_islam.active ? 'Aktif' : 'Nonaktif'}</Label>
              </div>
            </CardHeader>
            {settings.non_islam.active && (
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {['kabupaten', 'provinsi', 'nasional'].map(lvl => (
                  <div key={lvl} className="p-3 bg-muted/40 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold text-primary uppercase capitalize">Tingkat {lvl}</h4>
                    <div className="space-y-2">
                      {['1', '2', '3'].map(rank => {
                        const key = `${lvl}_juara_${rank}`;
                        return (
                          <div key={rank} className="flex justify-between items-center text-xs">
                            <span>Juara {rank}</span>
                            <Input type="number" className="w-16 text-right h-8" value={settings.non_islam.scores[key]} onChange={(e) => handleScoreChange('non_islam', key, Number(e.target.value))} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* PRAMUKA BEREGU */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Lomba Pramuka Beregu</CardTitle>
                <CardDescription className="text-xs">Lomba beregu Kwarcab, Kwarda, dan Kwarnas</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active-pramuka_beregu" checked={settings.pramuka_beregu.active} onCheckedChange={() => handleActiveToggle('pramuka_beregu')} />
                <Label htmlFor="active-pramuka_beregu" className="text-xs font-semibold cursor-pointer">{settings.pramuka_beregu.active ? 'Aktif' : 'Nonaktif'}</Label>
              </div>
            </CardHeader>
            {settings.pramuka_beregu.active && (
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {['kwarcab', 'kwarda', 'kwarnas'].map(lvl => (
                  <div key={lvl} className="p-3 bg-muted/40 rounded-lg border space-y-3">
                    <h4 className="text-xs font-bold text-primary uppercase capitalize">{lvl}</h4>
                    <div className="space-y-2">
                      {['1', '2', '3'].map(rank => {
                        const key = `${lvl}_juara_${rank}`;
                        return (
                          <div key={rank} className="flex justify-between items-center text-xs">
                            <span>Juara {rank}</span>
                            <Input type="number" className="w-16 text-right h-8" value={settings.pramuka_beregu.scores[key]} onChange={(e) => handleScoreChange('pramuka_beregu', key, Number(e.target.value))} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* PRAMUKA GARUDA / SKU */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Pramuka Garuda / SKU Perorangan</CardTitle>
                <CardDescription className="text-xs">Tingkatan Pramuka Penggalang Rakit, Terap, dan Garuda</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active-pramuka_garuda" checked={settings.pramuka_garuda.active} onCheckedChange={() => handleActiveToggle('pramuka_garuda')} />
                <Label htmlFor="active-pramuka_garuda" className="text-xs font-semibold cursor-pointer">{settings.pramuka_garuda.active ? 'Aktif' : 'Nonaktif'}</Label>
              </div>
            </CardHeader>
            {settings.pramuka_garuda.active && (
              <CardContent className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Penggalang Rakit</Label>
                  <Input type="number" className="text-right h-9" value={settings.pramuka_garuda.scores.rakit} onChange={(e) => handleScoreChange('pramuka_garuda', 'rakit', Number(e.target.value))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Penggalang Terap</Label>
                  <Input type="number" className="text-right h-9" value={settings.pramuka_garuda.scores.terap} onChange={(e) => handleScoreChange('pramuka_garuda', 'terap', Number(e.target.value))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Penggalang Garuda</Label>
                  <Input type="number" className="text-right h-9" value={settings.pramuka_garuda.scores.garuda} onChange={(e) => handleScoreChange('pramuka_garuda', 'garuda', Number(e.target.value))} />
                </div>
              </CardContent>
            )}
          </Card>

          {/* BUKU ISBN */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Karya Menulis Buku (Ber-ISBN)</CardTitle>
                <CardDescription className="text-xs">Bobot nilai untuk penulisan buku ber-ISBN</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="active-buku" checked={settings.buku.active} onCheckedChange={() => handleActiveToggle('buku')} />
                <Label htmlFor="active-buku" className="text-xs font-semibold cursor-pointer">{settings.buku.active ? 'Aktif' : 'Nonaktif'}</Label>
              </div>
            </CardHeader>
            {settings.buku.active && (
              <CardContent className="pt-2">
                <div className="flex items-center justify-between max-w-sm">
                  <Label className="text-sm font-medium">Nilai Karya Buku ISBN</Label>
                  <Input type="number" className="w-24 text-right h-9" value={settings.buku.scores.isbn} onChange={(e) => handleScoreChange('buku', 'isbn', Number(e.target.value))} />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
