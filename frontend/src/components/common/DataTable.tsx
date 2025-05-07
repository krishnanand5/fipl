import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Typography,
  Box,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T, index: number) => React.ReactNode;
  getValue?: (row: T) => string | number;
  width?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

interface DataTableProps<T> {
  title?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  expandable?: boolean;
  expandedContent?: (row: T) => React.ReactNode;
  rowStyle?: (row: T, index: number) => React.CSSProperties;
  containerStyle?: React.CSSProperties;
  size?: 'small' | 'medium';
  stickyHeader?: boolean;
}

export function DataTable<T>({
  title,
  columns,
  data,
  getRowKey,
  expandable = false,
  expandedContent,
  rowStyle,
  containerStyle,
  size = 'small',
  stickyHeader = false,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(key)) {
      newExpandedRows.delete(key);
    } else {
      newExpandedRows.add(key);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <Card 
      elevation={3}
      sx={{
        backgroundColor: 'black',
        overflow: 'hidden',
        border: '2px solid rgba(250, 231, 108, 0.79)',
        ...containerStyle
      }}
    >
      {title && (
        <Typography 
          variant="h5" 
          sx={{ 
            p: 2, 
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
      )}
      <TableContainer>
        <Table size={size} stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {expandable && (
                <TableCell padding="checkbox" />
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  className={column.className}
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    width: column.width,
                    ...column.style
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const rowKey = getRowKey(row);
              const isExpanded = expandedRows.has(rowKey);
              
              return (
                <React.Fragment key={rowKey}>
                  <TableRow
                    sx={{
                      backgroundColor: 'rgba(24, 18, 18, 0.9)',
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(83, 78, 78, 0.8)' },
                      ...(rowStyle ? rowStyle(row, index) : {})
                    }}
                  >
                    {expandable && (
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={() => toggleRow(rowKey)}
                        >
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        className={column.className}
                        style={column.style}
                      >
                        {column.render
                          ? column.render(row, index)
                          : column.getValue
                          ? column.getValue(row)
                          : (row as any)[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandable && expandedContent && (
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={columns.length + 1}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            {expandedContent(row)}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
} 