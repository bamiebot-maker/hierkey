; ModuleID = 'autocfg_2157d2a6edcad94f_3.bbfd34fe656dd97c-cgu.0'
source_filename = "autocfg_2157d2a6edcad94f_3.bbfd34fe656dd97c-cgu.0"
target datalayout = "e-m:w-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-windows-msvc"

; autocfg_2157d2a6edcad94f_3::probe
; Function Attrs: uwtable
define void @_ZN26autocfg_2157d2a6edcad94f_35probe17h92e4874a23a8be33E() unnamed_addr #0 {
start:
  %0 = alloca [4 x i8], align 4
  store i32 1, ptr %0, align 4
  %_0.i = load i32, ptr %0, align 4
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind speculatable willreturn memory(none)
declare i32 @llvm.cttz.i32(i32, i1 immarg) #1

attributes #0 = { uwtable "target-cpu"="x86-64" "target-features"="+cx16,+sse,+sse2,+sse3,+sahf" }
attributes #1 = { nocallback nofree nosync nounwind speculatable willreturn memory(none) }

!llvm.module.flags = !{!0}
!llvm.ident = !{!1}

!0 = !{i32 8, !"PIC Level", i32 2}
!1 = !{!"rustc version 1.93.0 (254b59607 2026-01-19)"}
