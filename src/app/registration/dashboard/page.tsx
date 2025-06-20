
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LayoutDashboard } from "lucide-react";

const chartData = [
  { track: "Afirmasi", applicants: 120, fill: "var(--color-afirmasi)" },
  { track: "Mutasi", applicants: 75, fill: "var(--color-mutasi)" },
  { track: "Prestasi", applicants: 200, fill: "var(--color-prestasi)" },
  { track: "Domisili", applicants: 150, fill: "var(--color-domisili)" },
];

const chartConfig = {
  applicants: {
    label: "Jumlah Pendaftar",
  },
  afirmasi: {
    label: "Afirmasi",
    color: "hsl(var(--chart-1))",
  },
  mutasi: {
    label: "Mutasi",
    color: "hsl(var(--chart-2))",
  },
  prestasi: {
    label: "Prestasi",
    color: "hsl(var(--chart-3))",
  },
  domisili: {
    label: "Domisili",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <LayoutDashboard size={40} />
          </div>
          <CardTitle className="text-3xl font-headline">Beranda Pendaftaran</CardTitle>
          <CardDescription className="text-md">
            Ringkasan data pendaftar berdasarkan jalur penerimaan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary text-center">Distribusi Pendaftar per Jalur</h2>
            <div className="aspect-[16/9] w-full">
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="track"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 10)}
                    />
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="applicants" radius={8} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
