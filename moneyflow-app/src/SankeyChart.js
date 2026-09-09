import React from 'react';
import Svg, {
  Path, Rect, Text as SvgText,
  Defs, LinearGradient, Stop,
} from 'react-native-svg';
import { INC, EXP } from './categories';
import { short } from './utils';

export default function SankeyChart({ txns, width: W, height: H, dark }) {
  const tc = dark ? '#ECF0F8' : '#0A1628';
  const mc = dark ? '#6B84A3' : '#5A738D';

  // Aggregate
  const im = {}, em = {};
  txns.forEach(t => {
    if (t.type === 'income') im[t.cat] = (im[t.cat] || 0) + t.amount;
    else em[t.cat] = (em[t.cat] || 0) + t.amount;
  });
  const iN = INC.filter(c => im[c.id]).map(c => ({ ...c, amt: im[c.id] }));
  const eN = EXP.filter(c => em[c.id]).map(c => ({ ...c, amt: em[c.id] }));

  if (!iN.length && !eN.length) {
    return (
      <Svg width={W} height={H}>
        <SvgText x={W / 2} y={H / 2} textAnchor="middle" fill={mc} fontSize="13">
          거래를 추가하면 흐름이 표시됩니다
        </SvgText>
      </Svg>
    );
  }
  if (!iN.length || !eN.length) {
    const msg = !iN.length ? '수입 내역을 추가하세요' : '지출 내역을 추가하세요';
    return (
      <Svg width={W} height={H}>
        <SvgText x={W / 2} y={H / 2} textAnchor="middle" fill={mc} fontSize="13">{msg}</SvgText>
      </Svg>
    );
  }

  const ti = iN.reduce((s, n) => s + n.amt, 0);
  const te = eN.reduce((s, n) => s + n.amt, 0);
  const pT = 26, pB = 6, LW = 68, nW = 8, gap = 5;
  const iX = LW, eX = W - LW - nW;
  const avH = H - pT - pB;

  let y = pT;
  iN.forEach(n => { n.nh = Math.max(2, (avH - Math.max(0, iN.length - 1) * gap) * n.amt / ti); n.y = y; y += n.nh + gap; });
  y = pT;
  eN.forEach(n => { n.nh = Math.max(2, (avH - Math.max(0, eN.length - 1) * gap) * n.amt / te); n.y = y; y += n.nh + gap; });

  const io = {}, eo = {};
  iN.forEach(n => io[n.id] = 0);
  eN.forEach(n => eo[n.id] = 0);

  const gradDefs = [];
  const flows = [];

  for (const inc of iN) {
    for (const exp of eN) {
      const fhi = inc.nh * (exp.amt / te);
      const fhe = exp.nh * (inc.amt / ti);
      const y1t = inc.y + io[inc.id], y1b = y1t + fhi;
      const y2t = exp.y + eo[exp.id], y2b = y2t + fhe;
      const cp1 = iX + nW + (eX - iX - nW) * 0.42;
      const cp2 = iX + nW + (eX - iX - nW) * 0.58;
      const gId = `g_${inc.id}_${exp.id}`;

      gradDefs.push(
        <LinearGradient key={gId} id={gId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={inc.color} stopOpacity="0.4" />
          <Stop offset="1" stopColor={exp.color} stopOpacity="0.3" />
        </LinearGradient>
      );

      const d = [
        `M ${iX + nW} ${y1t}`,
        `C ${cp1} ${y1t} ${cp2} ${y2t} ${eX} ${y2t}`,
        `L ${eX} ${y2b}`,
        `C ${cp2} ${y2b} ${cp1} ${y1b} ${iX + nW} ${y1b}`,
        'Z',
      ].join(' ');

      flows.push(<Path key={gId} d={d} fill={`url(#${gId})`} />);
      io[inc.id] += fhi;
      eo[exp.id] += fhe;
    }
  }

  return (
    <Svg width={W} height={H}>
      <Defs>{gradDefs}</Defs>

      {flows}

      {iN.map(n => (
        <React.Fragment key={n.id}>
          <Rect x={iX} y={n.y} width={nW} height={Math.max(1, n.nh)} rx={Math.min(3, n.nh / 2)} fill={n.color} />
          {n.nh >= 14 && (
            <SvgText
              x={iX - 5}
              y={n.y + n.nh / 2 + (n.nh >= 26 ? -4 : 0)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={tc} fontSize="11" fontWeight="600"
            >{n.name}</SvgText>
          )}
          {n.nh >= 26 && (
            <SvgText x={iX - 5} y={n.y + n.nh / 2 + 9} textAnchor="end" fill={mc} fontSize="10">
              {short(n.amt)}
            </SvgText>
          )}
        </React.Fragment>
      ))}

      {eN.map(n => (
        <React.Fragment key={n.id}>
          <Rect x={eX} y={n.y} width={nW} height={Math.max(1, n.nh)} rx={Math.min(3, n.nh / 2)} fill={n.color} />
          {n.nh >= 14 && (
            <SvgText
              x={eX + nW + 5}
              y={n.y + n.nh / 2 + (n.nh >= 26 ? -4 : 0)}
              textAnchor="start"
              dominantBaseline="middle"
              fill={tc} fontSize="11" fontWeight="600"
            >{n.name}</SvgText>
          )}
          {n.nh >= 26 && (
            <SvgText x={eX + nW + 5} y={n.y + n.nh / 2 + 9} textAnchor="start" fill={mc} fontSize="10">
              {short(n.amt)}
            </SvgText>
          )}
        </React.Fragment>
      ))}

      <SvgText x={iX - 5} y={10} textAnchor="end" fill={mc} fontSize="9" fontWeight="600">수입</SvgText>
      <SvgText x={eX + nW + 5} y={10} textAnchor="start" fill={mc} fontSize="9" fontWeight="600">지출</SvgText>
    </Svg>
  );
}
